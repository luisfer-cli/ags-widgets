#!/bin/bash

# Script simplificado para capturar eventos de teclado con libinput
# Devuelve JSON con las últimas teclas presionadas

CACHE_FILE="/tmp/ags-keyhistory.txt"
DAEMON_PID_FILE="/tmp/ags-keylogger.pid"

# Función para mapear códigos de tecla a nombres legibles
map_key_name() {
    local key_code="$1"
    case "$key_code" in
        "KEY_A") echo "A" ;;
        "KEY_B") echo "B" ;;
        "KEY_C") echo "C" ;;
        "KEY_D") echo "D" ;;
        "KEY_E") echo "E" ;;
        "KEY_F") echo "F" ;;
        "KEY_G") echo "G" ;;
        "KEY_H") echo "H" ;;
        "KEY_I") echo "I" ;;
        "KEY_J") echo "J" ;;
        "KEY_K") echo "K" ;;
        "KEY_L") echo "L" ;;
        "KEY_M") echo "M" ;;
        "KEY_N") echo "N" ;;
        "KEY_O") echo "O" ;;
        "KEY_P") echo "P" ;;
        "KEY_Q") echo "Q" ;;
        "KEY_R") echo "R" ;;
        "KEY_S") echo "S" ;;
        "KEY_T") echo "T" ;;
        "KEY_U") echo "U" ;;
        "KEY_V") echo "V" ;;
        "KEY_W") echo "W" ;;
        "KEY_X") echo "X" ;;
        "KEY_Y") echo "Y" ;;
        "KEY_Z") echo "Z" ;;
        "KEY_0") echo "0" ;;
        "KEY_1") echo "1" ;;
        "KEY_2") echo "2" ;;
        "KEY_3") echo "3" ;;
        "KEY_4") echo "4" ;;
        "KEY_5") echo "5" ;;
        "KEY_6") echo "6" ;;
        "KEY_7") echo "7" ;;
        "KEY_8") echo "8" ;;
        "KEY_9") echo "9" ;;
        "KEY_SPACE") echo "SPC" ;;
        "KEY_ENTER") echo "ENT" ;;
        "KEY_BACKSPACE") echo "BSP" ;;
        "KEY_TAB") echo "TAB" ;;
        "KEY_LEFTSHIFT"|"KEY_RIGHTSHIFT") echo "SHF" ;;
        "KEY_LEFTCTRL"|"KEY_RIGHTCTRL") echo "CTL" ;;
        "KEY_LEFTALT"|"KEY_RIGHTALT") echo "ALT" ;;
        "KEY_LEFTMETA"|"KEY_RIGHTMETA") echo "SUP" ;;
        "KEY_ESC") echo "ESC" ;;
        "KEY_UP") echo "↑" ;;
        "KEY_DOWN") echo "↓" ;;
        "KEY_LEFT") echo "←" ;;
        "KEY_RIGHT") echo "→" ;;
        "KEY_F1") echo "F1" ;;
        "KEY_F2") echo "F2" ;;
        "KEY_F3") echo "F3" ;;
        "KEY_F4") echo "F4" ;;
        "KEY_F5") echo "F5" ;;
        "KEY_F6") echo "F6" ;;
        "KEY_F7") echo "F7" ;;
        "KEY_F8") echo "F8" ;;
        "KEY_F9") echo "F9" ;;
        "KEY_F10") echo "F10" ;;
        "KEY_F11") echo "F11" ;;
        "KEY_F12") echo "F12" ;;
        "KEY_COMMA") echo "," ;;
        "KEY_DOT") echo "." ;;
        "KEY_SLASH") echo "/" ;;
        "KEY_SEMICOLON") echo ";" ;;
        "KEY_APOSTROPHE") echo "'" ;;
        "KEY_LEFTBRACE") echo "[" ;;
        "KEY_RIGHTBRACE") echo "]" ;;
        "KEY_BACKSLASH") echo "\\" ;;
        "KEY_MINUS") echo "-" ;;
        "KEY_EQUAL") echo "=" ;;
        "KEY_GRAVE") echo "\`" ;;
        *) echo "" ;;
    esac
}

# Función para iniciar el daemon de captura
start_daemon() {
    if [[ ! -f "$DAEMON_PID_FILE" ]] || ! kill -0 "$(cat "$DAEMON_PID_FILE")" 2>/dev/null; then
        {
            sudo libinput debug-events 2>/dev/null | grep -E "KEYBOARD_KEY.*pressed" | while read -r line; do
                key_code=$(echo "$line" | sed -n 's/.*(\([^)]*\)).*/\1/p')
                if [[ -n "$key_code" ]]; then
                    mapped_key=$(map_key_name "$key_code")
                    if [[ -n "$mapped_key" ]]; then
                        echo "$mapped_key" >> "$CACHE_FILE"
                        # Mantener solo las últimas 10 líneas
                        tail -10 "$CACHE_FILE" > "$CACHE_FILE.tmp" 2>/dev/null
                        mv "$CACHE_FILE.tmp" "$CACHE_FILE" 2>/dev/null
                    fi
                fi
            done
        } &
        echo $! > "$DAEMON_PID_FILE"
    fi
}

# Inicializar cache si no existe
[[ ! -f "$CACHE_FILE" ]] && touch "$CACHE_FILE"

# Iniciar daemon
start_daemon

# Construir JSON manualmente
json_keys=""
if [[ -f "$CACHE_FILE" ]]; then
    while IFS= read -r key; do
        if [[ -n "$key" ]]; then
            if [[ -z "$json_keys" ]]; then
                json_keys="\"$key\""
            else
                json_keys="$json_keys,\"$key\""
            fi
        fi
    done < "$CACHE_FILE"
fi

echo "{\"keys\": [$json_keys]}"