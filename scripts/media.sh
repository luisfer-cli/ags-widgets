#!/bin/bash

# Verifica si hay algún reproductor activo y reproduciendo
if playerctl status 2>/dev/null | grep -q "Playing"; then
    # Obtener metadatos
    artist=$(playerctl metadata artist 2>/dev/null)
    title=$(playerctl metadata title 2>/dev/null)
    album=$(playerctl metadata album 2>/dev/null)
    player=$(playerctl metadata --format '{{playerName}}' 2>/dev/null)

    # Limitar title a máximo 20 caracteres con "..." si se recorta
    if [ ${#title} -gt 20 ]; then
        title="${title:0:17}..."
    fi

    # Imprimir JSON
    printf '{ "player": "%s", "artist": "%s", "title": "%s", "album": "%s" }\n' \
        "$player" "$artist" "$title" "$album"
fi

