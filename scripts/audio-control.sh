#!/bin/bash
# Audio control script for PulseAudio

case "$1" in
    "list-sinks")
        pactl list sinks
        ;;
    "list-sources")
        pactl list sources
        ;;
    "set-volume")
        # $2 = sink/source, $3 = index, $4 = volume%
        pactl set-$2-volume "$3" "$4"
        ;;
    "toggle-mute")
        # $2 = sink/source, $3 = index
        pactl set-$2-mute "$3" toggle
        ;;
    "get-volume")
        # $2 = sink index or @DEFAULT_SINK@
        pactl get-sink-volume "${2:-@DEFAULT_SINK@}"
        ;;
    *)
        echo "Usage: $0 {list-sinks|list-sources|set-volume|toggle-mute|get-volume}"
        exit 1
        ;;
esac