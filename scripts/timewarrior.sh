#!/bin/bash

# Script para obtener información de timewarrior
# Retorna JSON con tiempo actual, tareas recientes y estadísticas diarias

set -euo pipefail

# Verificar si timewarrior está instalado
if ! command -v timew &> /dev/null; then
    echo '{"currentTask": null, "todayTime": 0, "weekTime": 0, "recentTasks": [], "isTracking": false, "error": "timewarrior not installed"}'
    exit 0
fi

# Función para obtener el tiempo actual en segundos
get_current_tracking() {
    local current=$(timew get dom.active 2>/dev/null || echo "0")
    if [ "$current" = "1" ]; then
        # Hay una tarea activa, obtener información
        local task_info=$(timew export :ids | jq -r 'last | .tags[0] // "No description"' 2>/dev/null || echo "Active task")
        local start_time=$(timew export :ids | jq -r 'last | .start' 2>/dev/null || echo "")
        echo "{\"description\": \"$task_info\", \"startTime\": \"$start_time\", \"isActive\": true}"
    else
        echo "{\"description\": null, \"startTime\": null, \"isActive\": false}"
    fi
}

# Función para obtener tiempo total de hoy
get_today_time() {
    local today_time=$(timew summary today 2>/dev/null | grep -E "^[[:space:]]*[0-9]+:[0-9]+:[0-9]+[[:space:]]*$" | awk '{print $1}' || echo "0:00:00")
    if [ -z "$today_time" ] || [ "$today_time" = "0:00:00" ]; then
        echo "0"
    else
        # Convertir H:MM:SS a segundos
        IFS=':' read -ra TIME_PARTS <<< "$today_time"
        local hours=${TIME_PARTS[0]:-0}
        local minutes=${TIME_PARTS[1]:-0}
        local seconds=${TIME_PARTS[2]:-0}
        echo $((hours * 3600 + minutes * 60 + seconds))
    fi
}

# Función para obtener tiempo total de la semana
get_week_time() {
    local week_time=$(timew summary week 2>/dev/null | grep -E "^[[:space:]]*[0-9]+:[0-9]+:[0-9]+[[:space:]]*$" | awk '{print $1}' || echo "0:00:00")
    if [ -z "$week_time" ] || [ "$week_time" = "0:00:00" ]; then
        echo "0"
    else
        # Convertir H:MM:SS a segundos
        IFS=':' read -ra TIME_PARTS <<< "$week_time"
        local hours=${TIME_PARTS[0]:-0}
        local minutes=${TIME_PARTS[1]:-0}
        local seconds=${TIME_PARTS[2]:-0}
        echo $((hours * 3600 + minutes * 60 + seconds))
    fi
}

# Función para obtener tareas recientes (últimas 3)
get_recent_tasks() {
    local recent=$(timew export today 2>/dev/null | jq '[.[] | select(.end != null) | {
        tags: (.tags // []),
        start: .start,
        end: .end,
        duration: ((.end | strptime("%Y%m%dT%H%M%SZ") | mktime) - (.start | strptime("%Y%m%dT%H%M%SZ") | mktime))
    }] | sort_by(.start) | reverse | limit(3; .) | map(select(.tags | length > 0))')
    
    if [ -z "$recent" ] || [ "$recent" = "null" ]; then
        echo "[]"
    else
        echo "$recent"
    fi
}

# Obtener todos los datos
CURRENT_TRACKING=$(get_current_tracking)
TODAY_TIME=$(get_today_time)
WEEK_TIME=$(get_week_time)
RECENT_TASKS=$(get_recent_tasks)
IS_TRACKING=$(echo "$CURRENT_TRACKING" | jq -r '.isActive')

# Crear JSON final
jq -n \
    --argjson current "$CURRENT_TRACKING" \
    --arg todayTime "$TODAY_TIME" \
    --arg weekTime "$WEEK_TIME" \
    --argjson recent "$RECENT_TASKS" \
    --argjson isTracking "$IS_TRACKING" \
    '{
        currentTask: (if $current.isActive then {
            description: $current.description,
            startTime: $current.startTime
        } else null end),
        todayTime: ($todayTime | tonumber),
        weekTime: ($weekTime | tonumber),
        recentTasks: $recent,
        isTracking: $isTracking
    }'