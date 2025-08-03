#!/bin/bash

STAT_FILE="/tmp/cpu_stat_prev"
NET_FILE="/tmp/net_stat_prev"

# Función para calcular CPU usage a partir de dos líneas de /proc/stat
calc_cpu_usage() {
  read -r _ user1 nice1 sys1 idle1 iowait1 irq1 softirq1 steal1 _ <<< "$1"
  read -r _ user2 nice2 sys2 idle2 iowait2 irq2 softirq2 steal2 _ <<< "$2"

  total1=$((user1 + nice1 + sys1 + idle1 + iowait1 + irq1 + softirq1 + steal1))
  total2=$((user2 + nice2 + sys2 + idle2 + iowait2 + irq2 + softirq2 + steal2))
  idle1_total=$((idle1 + iowait1))
  idle2_total=$((idle2 + iowait2))

  delta_total=$((total2 - total1))
  delta_idle=$((idle2_total - idle1_total))

  if [ "$delta_total" -eq 0 ]; then
    echo "0.0"
  else
    awk -v dt="$delta_total" -v di="$delta_idle" \
      'BEGIN { printf "%.1f", (100 * (dt - di)) / dt }'
  fi
}

# Función mejorada para obtener información de GPU AMD
get_gpu_info() {
  gpu_usage=0
  gpu_memory=0
  gpu_temp=0
  gpu_found=false

  # 1. Intentar NVIDIA primero
  if command -v nvidia-smi &> /dev/null; then
    gpu_usage=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d ' ')
    gpu_memory=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d ' ')
    gpu_temp=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d ' ')
    
    if [[ "$gpu_usage" =~ ^[0-9]+$ ]]; then
      gpu_found=true
    fi
  fi

  # 2. Si no hay NVIDIA, intentar AMD integrada
  if [ "$gpu_found" = false ]; then
    # Buscar GPU AMD en /sys/class/drm/
    for card in /sys/class/drm/card*/device; do
      if [ -f "$card/vendor" ]; then
        vendor=$(cat "$card/vendor" 2>/dev/null)
        # AMD vendor ID es 0x1002
        if [ "$vendor" = "0x1002" ]; then
          # Intentar obtener uso de GPU desde debugfs (requiere root) o estimaciones
          if [ -f "$card/gpu_busy_percent" ]; then
            gpu_usage=$(cat "$card/gpu_busy_percent" 2>/dev/null | head -1)
            gpu_found=true
          elif [ -d "$card/hwmon" ]; then
            # Buscar información de temperatura en hwmon
            for hwmon in "$card"/hwmon/hwmon*; do
              if [ -f "$hwmon/temp1_input" ]; then
                temp_raw=$(cat "$hwmon/temp1_input" 2>/dev/null)
                if [[ "$temp_raw" =~ ^[0-9]+$ ]]; then
                  gpu_temp=$(awk "BEGIN { printf \"%.0f\", $temp_raw / 1000 }")
                fi
              fi
            done
            gpu_found=true
            # Para GPUs integradas AMD, estimamos uso basado en frecuencia si está disponible
            if [ -f "$card/pp_dpm_sclk" ]; then
              current_freq=$(grep '\*' "$card/pp_dpm_sclk" 2>/dev/null | awk '{print $2}' | sed 's/MHz//')
              if [[ "$current_freq" =~ ^[0-9]+$ ]] && [ "$current_freq" -gt 0 ]; then
                # Estimación muy básica: frecuencias altas = más uso
                gpu_usage=$(awk "BEGIN { printf \"%.0f\", ($current_freq / 10) }")
                if [ "$gpu_usage" -gt 100 ]; then
                  gpu_usage=100
                fi
              fi
            fi
          fi
          break
        fi
      fi
    done
  fi

  # 3. Si aún no encontramos nada, intentar radeontop
  if [ "$gpu_found" = false ] && command -v radeontop &> /dev/null; then
    gpu_info=$(timeout 1s radeontop -d - -l 1 2>/dev/null | tail -1)
    if [[ $gpu_info =~ gpu\ ([0-9]+)% ]]; then
      gpu_usage="${BASH_REMATCH[1]}"
      gpu_found=true
    fi
  fi

  # 4. Si aún no hay GPU, buscar en /proc/driver/amdgpu (si existe)
  if [ "$gpu_found" = false ] && [ -d "/proc/driver/amdgpu" ]; then
    # Buscar archivos de información de AMD GPU
    for amdgpu_dir in /proc/driver/amdgpu/*; do
      if [ -f "$amdgpu_dir/amdgpu_pm_info" ]; then
        gpu_usage=$(grep -i "GPU Load" "$amdgpu_dir/amdgpu_pm_info" 2>/dev/null | awk '{print $3}' | sed 's/%//')
        if [[ "$gpu_usage" =~ ^[0-9]+$ ]]; then
          gpu_found=true
          break
        fi
      fi
    done
  fi

  # Validar que sean números válidos
  if ! [[ "$gpu_usage" =~ ^[0-9]+$ ]]; then
    gpu_usage=0
  fi
  if ! [[ "$gpu_memory" =~ ^[0-9]+$ ]]; then
    gpu_memory=0
  fi
  if ! [[ "$gpu_temp" =~ ^[0-9]+$ ]]; then
    gpu_temp=0
  fi

  echo "\"gpu\": {\"usage\": $gpu_usage, \"memory\": $gpu_memory, \"temperature\": $gpu_temp, \"detected\": $gpu_found},"
}

# Función para obtener información de disco
get_disk_info() {
  disk_info=$(df / 2>/dev/null | tail -1)
  if [ ! -z "$disk_info" ]; then
    disk_used=$(echo $disk_info | awk '{print $3}')
    disk_total=$(echo $disk_info | awk '{print $2}')
    disk_usage=$(echo $disk_info | awk '{printf "%.1f", ($3/$2)*100}')
    
    # Convertir de KB a GB
    disk_used_gb=$(awk "BEGIN { printf \"%.2f\", $disk_used / 1048576 }")
    disk_total_gb=$(awk "BEGIN { printf \"%.2f\", $disk_total / 1048576 }")
    
    echo "\"disk\": {\"usage\": $disk_usage, \"used_gb\": $disk_used_gb, \"total_gb\": $disk_total_gb},"
  else
    echo "\"disk\": {\"usage\": 0, \"used_gb\": 0, \"total_gb\": 0},"
  fi
}

# Función para obtener información de red
get_network_info() {
  # Buscar la primera interfaz de red activa
  current_net=$(grep -E '^(eth|wlan|enp|wlp)' /proc/net/dev 2>/dev/null | head -1 | awk '{gsub(/:/, " "); print $2,$10}')
  
  if [ -f "$NET_FILE" ] && [ ! -z "$current_net" ]; then
    prev_net=$(cat "$NET_FILE" 2>/dev/null)
    if [ ! -z "$prev_net" ]; then
      read -r curr_rx curr_tx <<< "$current_net"
      read -r prev_rx prev_tx <<< "$prev_net"
      
      # Validar que sean números
      if [[ "$curr_rx" =~ ^[0-9]+$ ]] && [[ "$prev_rx" =~ ^[0-9]+$ ]]; then
        # Calcular velocidad en KB/s (asumiendo 2 segundos entre mediciones)
        rx_speed=$(awk "BEGIN { printf \"%.1f\", ($curr_rx - $prev_rx) / 2048 }")
        tx_speed=$(awk "BEGIN { printf \"%.1f\", ($curr_tx - $prev_tx) / 2048 }")
        
        echo "\"network\": {\"download\": $rx_speed, \"upload\": $tx_speed},"
      else
        echo "\"network\": {\"download\": 0, \"upload\": 0},"
      fi
    else
      echo "\"network\": {\"download\": 0, \"upload\": 0},"
    fi
  else
    echo "\"network\": {\"download\": 0, \"upload\": 0},"
  fi
  
  # Guardar estadísticas actuales si son válidas
  if [ ! -z "$current_net" ]; then
    echo "$current_net" > "$NET_FILE"
  fi
}

# Función para obtener uptime
get_uptime() {
  if [ -f /proc/uptime ]; then
    uptime_seconds=$(awk '{print int($1)}' /proc/uptime)
    echo "\"uptime\": $uptime_seconds,"
  else
    echo "\"uptime\": 0,"
  fi
}

# Función para obtener temperatura del CPU
get_cpu_temp() {
  cpu_temp=0
  
  # Intentar diferentes fuentes de temperatura
  if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    temp_raw=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null)
    if [[ "$temp_raw" =~ ^[0-9]+$ ]]; then
      cpu_temp=$(awk "BEGIN { printf \"%.1f\", $temp_raw / 1000 }")
    fi
  elif command -v sensors &> /dev/null; then
    # Usar lm-sensors si está disponible
    temp_line=$(sensors 2>/dev/null | grep -i "core 0\|cpu" | head -1)
    if [[ $temp_line =~ \+([0-9]+\.[0-9]+)°C ]]; then
      cpu_temp="${BASH_REMATCH[1]}"
    fi
  fi
  
  echo "\"temperature\": $cpu_temp,"
}

# Función para obtener top procesos
get_top_processes() {
  processes=$(ps -eo comm,pcpu,pmem --sort=-pcpu --no-headers 2>/dev/null | head -3 | awk '{
    gsub(/"/,"\\\"", $1); 
    gsub(/\[/, "", $1);
    gsub(/\]/, "", $1);
    if (length($1) > 15) $1 = substr($1, 1, 12) "...";
    printf "{\"name\":\"%s\",\"cpu\":%.1f,\"memory\":%.1f},", $1, $2, $3
  }')
  # Remover la última coma
  processes=${processes%,}
  if [ -z "$processes" ]; then
    processes="{\"name\":\"none\",\"cpu\":0,\"memory\":0}"
  fi
  echo "\"processes\": [$processes]"
}

# Obtener nueva lectura de CPU
current_cpu_line=$(grep '^cpu ' /proc/stat)

# Obtener memoria
if [ -f /proc/meminfo ]; then
  read -r _ mem_total _ < <(grep MemTotal /proc/meminfo)
  read -r _ mem_available _ < <(grep MemAvailable /proc/meminfo)
  mem_used=$((mem_total - mem_available))

  mem_used_gb=$(awk "BEGIN { printf \"%.2f\", $mem_used / 1048576 }")
  mem_total_gb=$(awk "BEGIN { printf \"%.2f\", $mem_total / 1048576 }")
  mem_usage_percent=$(awk "BEGIN { printf \"%.1f\", ($mem_used / $mem_total) * 100 }")
else
  mem_used_gb="0.0"
  mem_total_gb="0.0"
  mem_usage_percent="0.0"
fi

# Leer línea previa del archivo si existe
if [ -f "$STAT_FILE" ]; then
  prev_cpu_line=$(cat "$STAT_FILE")
  cpu_usage=$(calc_cpu_usage "$prev_cpu_line" "$current_cpu_line")
else
  cpu_usage="0.0"
fi

# Guardar la lectura actual para la próxima ejecución
echo "$current_cpu_line" > "$STAT_FILE"

# Generar JSON válido
cat << EOF
{
  "cpu": $cpu_usage,
  "memory": $mem_usage_percent,
  "ram_used_gb": $mem_used_gb,
  "ram_total_gb": $mem_total_gb,
  $(get_cpu_temp)
  $(get_gpu_info)
  $(get_disk_info)
  $(get_network_info)
  $(get_uptime)
  $(get_top_processes),
  "timestamp": $(date +%s)
}
EOF