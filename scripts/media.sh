#!/bin/bash

# Verifica si hay algún reproductor activo y reproduciendo
if playerctl status 2>/dev/null | grep -q "Playing"; then
    # Obtener metadatos
    artist=$(playerctl metadata artist 2>/dev/null)
    title=$(playerctl metadata title 2>/dev/null)
    album=$(playerctl metadata album 2>/dev/null)
    player=$(playerctl metadata --format '{{playerName}}' 2>/dev/null)

    # Imprimir JSON
    printf '{ "player": "%s", "artist": "%s", "title": "%s", "album": "%s" }\n' \
        "$player" "$artist" "$title" "$album"
fi


