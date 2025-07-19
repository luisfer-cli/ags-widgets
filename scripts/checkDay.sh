#!/bin/bash

carpeta="${1:-/home/luisfer/notes/journal}"

ano=$(date +%Y)
mes=$(date +%m)
dia=$(date +%d)
archivo="$ano-$mes-$dia.md"

if [ -f "$carpeta/$archivo" ]; then
    exit 0
else
    exit 1
fi

