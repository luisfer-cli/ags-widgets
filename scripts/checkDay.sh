#!/bin/bash

carpeta="${1:-/home/luisfer/notes/journal}"

ano=$(date +%Y)
mes=$(date +%m)
dia=$(date +%d)
archivo="$ano-$mes-$dia.md"

[ -f "$carpeta/$archivo" ] && echo true || echo false
