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
    local today_seconds=$(timew summary today 2>/dev/null | grep "Total" | awk '{print $2}' | sed 's/://g' | head -1 || echo "000000")
    if [ -z "$today_seconds" ] || [ "$today_seconds" = "000000" ]; then
        echo "0"
    else
        # Convertir HHMMSS a segundos
        local hours=${today_seconds:0:2}
        local minutes=${today_seconds:2:2}  
        local seconds=${today_seconds:4:2}
        echo $((10#$hours * 3600 + 10#$minutes * 60 + 10#$seconds))
    fi
}

# Función para obtener tiempo total de la semana
get_week_time() {
    local week_seconds=$(timew summary week 2>/dev/null | grep "Total" | awk '{print $2}' | sed 's/://g' | head -1 || echo "000000")
    if [ -z "$week_seconds" ] || [ "$week_seconds" = "000000" ]; then
        echo "0"
    else
        # Convertir HHMMSS a segundos
        local hours=${week_seconds:0:2}
        local minutes=${week_seconds:2:2}
        local seconds=${week_seconds:4:2}
        echo $((10#$hours * 3600 + 10#$minutes * 60 + 10#$seconds))
    fi
}

# Función para obtener tareas recientes (últimas 3)
get_recent_tasks() {
    local recent=$(timew export today 2>/dev/null | jq '[.[] | {
        tags: (.tags // []),
        start: .start,
        end: (.end // null),
        duration: (if .end then (.end | strptime("%Y%m%dT%H%M%SZ") | mktime) - (.start | strptime("%Y%m%dT%H%M%SZ") | mktime) else null end)
    }] | sort_by(.start) | reverse | limit(3; .[])')
    
    if [ -z "$recent" ] || [ "$recent" = "null" ]; then
        echo "[]"
    else
        echo "[$recent]" | jq 'map(select(.tags | length > 0))'
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