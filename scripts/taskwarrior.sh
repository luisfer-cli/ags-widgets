#!/bin/bash

# Script para obtener tareas pendientes y completadas de taskwarrior
# Retorna JSON con las tareas pendientes y completadas limitadas a las más importantes

set -euo pipefail

# Verificar si taskwarrior está instalado
if ! command -v task &> /dev/null; then
    echo '{"pending": [], "completed": [], "pendingCount": 0, "completedToday": 0, "error": "taskwarrior not installed"}'
    exit 0
fi

# Obtener tareas pendientes (máximo 3 para no saturar el widget)
PENDING_TASKS=$(task export status:pending limit:3 2>/dev/null || echo "[]")

# Obtener tareas completadas hoy (máximo 2)
COMPLETED_TASKS=$(task export status:completed end.after:today limit:2 2>/dev/null || echo "[]")

# Si no hay tareas o hay error, retornar estructura vacía
if [ "$PENDING_TASKS" = "[]" ]; then
    PENDING_TASKS="[]"
fi

if [ "$COMPLETED_TASKS" = "[]" ]; then
    COMPLETED_TASKS="[]"
fi

# Procesar las tareas pendientes
PROCESSED_PENDING=$(echo "$PENDING_TASKS" | jq '[.[] | {
    id: .id,
    description: .description,
    urgency: .urgency,
    priority: (.priority // "M"),
    project: (.project // ""),
    status: "pending"
}] | sort_by(-.urgency)')

# Procesar las tareas completadas
PROCESSED_COMPLETED=$(echo "$COMPLETED_TASKS" | jq '[.[] | {
    id: .id,
    description: .description,
    urgency: (.urgency // 0),
    priority: (.priority // "M"),
    project: (.project // ""),
    status: "completed"
}]')

# Contar total de tareas pendientes
PENDING_COUNT=$(task +PENDING count 2>/dev/null || echo "0")

# Contar tareas completadas hoy
COMPLETED_TODAY=$(task +COMPLETED end.after:today count 2>/dev/null || echo "0")

# Crear JSON final
jq -n \
    --argjson pending "$PROCESSED_PENDING" \
    --argjson completed "$PROCESSED_COMPLETED" \
    --arg pendingCount "$PENDING_COUNT" \
    --arg completedToday "$COMPLETED_TODAY" \
    '{
        pending: $pending,
        completed: $completed,
        pendingCount: ($pendingCount | tonumber),
        completedToday: ($completedToday | tonumber)
    }'