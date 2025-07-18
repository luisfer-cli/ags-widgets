#!/bin/bash

STAT_FILE="/tmp/cpu_stat_prev"

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

# Obtener nueva lectura de CPU
current_cpu_line=$(grep '^cpu ' /proc/stat)

# Obtener memoria
read -r _ mem_total _ < <(grep MemTotal /proc/meminfo)
read -r _ mem_available _ < <(grep MemAvailable /proc/meminfo)
mem_used=$((mem_total - mem_available))

mem_used_gb=$(awk "BEGIN { printf \"%.2f\", $mem_used / 1048576 }")
mem_total_gb=$(awk "BEGIN { printf \"%.2f\", $mem_total / 1048576 }")

# Leer línea previa del archivo si existe
if [ -f "$STAT_FILE" ]; then
  prev_cpu_line=$(cat "$STAT_FILE")
  cpu_usage=$(calc_cpu_usage "$prev_cpu_line" "$current_cpu_line")
else
  cpu_usage="0.0"
fi

# Guardar la lectura actual para la próxima ejecución
echo "$current_cpu_line" > "$STAT_FILE"

# Mostrar resultados en JSON
echo "{
  \"ram_used_gb\": $mem_used_gb,
  \"ram_total_gb\": $mem_total_gb,
  \"cpu_usage_percent\": $cpu_usage
}"

