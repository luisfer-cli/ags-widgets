#!/bin/bash

# Wrapper script para flowmodoro.py
# Convierte la salida de flowmodoro status a JSON para AGS

# Verificar que flowmodoro.py esté disponible
if ! command -v flowmodoro.py &> /dev/null; then
    echo '{"mode": "error", "message": "flowmodoro.py not found"}'
    exit 1
fi

# Obtener status del flowmodoro
status_output=$(flowmodoro.py status 2>/dev/null)

# Verificar si hay una sesión activa
if echo "$status_output" | grep -q "No active session"; then
    echo '{"mode": "none", "message": "No active session"}'
    exit 0
fi

# Parsear la salida
mode=""
worked_seconds=0
worked_hms=""
remaining_seconds=0
remaining_hms=""

while IFS='=' read -r key value; do
    case "$key" in
        "mode")
            mode="$value"
            ;;
        "worked_seconds")
            worked_seconds="$value"
            ;;
        "worked_hms")
            worked_hms="$value"
            ;;
        "remaining_seconds")
            remaining_seconds="$value"
            ;;
        "remaining_hms")
            remaining_hms="$value"
            ;;
    esac
done <<< "$status_output"

# Generar JSON según el modo
case "$mode" in
    "work")
        echo "{\"mode\": \"work\", \"worked_seconds\": $worked_seconds, \"worked_hms\": \"$worked_hms\", \"status\": \"Working\"}"
        ;;
    "break")
        echo "{\"mode\": \"break\", \"remaining_seconds\": $remaining_seconds, \"remaining_hms\": \"$remaining_hms\", \"status\": \"Break time\"}"
        ;;
    *)
        echo '{"mode": "none", "message": "Unknown state"}'
        ;;
esac