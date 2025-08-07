#!/bin/bash

# Script de prueba que simula datos de teclas
# Agregar algunas teclas de prueba al archivo

CACHE_FILE="/tmp/ags-keyhistory.txt"

# Simular algunas teclas si el archivo está vacío
if [[ ! -f "$CACHE_FILE" ]] || [[ ! -s "$CACHE_FILE" ]]; then
    echo "H" > "$CACHE_FILE"
    echo "E" >> "$CACHE_FILE"
    echo "L" >> "$CACHE_FILE"
    echo "L" >> "$CACHE_FILE"
    echo "O" >> "$CACHE_FILE"
fi

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