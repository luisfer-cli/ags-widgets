#!/bin/bash

# CVLC Control Script
# Manages VLC command line player with various controls

ACTION="$1"
MEDIA_FILE="$2"

# Get cvlc process info
get_cvlc_status() {
    if pgrep -x cvlc > /dev/null; then
        echo '{ "status": "running", "pid": "'$(pgrep -x cvlc)'", "playing": true }'
    else
        echo '{ "status": "stopped", "pid": "", "playing": false }'
    fi
}

# Control cvlc playback
case "$ACTION" in
    "status")
        get_cvlc_status
        ;;
    "play")
        if [ -n "$MEDIA_FILE" ]; then
            if pgrep -x cvlc > /dev/null; then
                pkill cvlc
                sleep 0.5
            fi
            cvlc --intf dummy "$MEDIA_FILE" &
            echo '{ "action": "play", "file": "'$MEDIA_FILE'", "success": true }'
        else
            echo '{ "action": "play", "error": "No media file provided", "success": false }'
        fi
        ;;
    "stop")
        if pgrep -x cvlc > /dev/null; then
            pkill cvlc
            echo '{ "action": "stop", "success": true }'
        else
            echo '{ "action": "stop", "error": "No cvlc process running", "success": false }'
        fi
        ;;
    "toggle")
        if pgrep -x cvlc > /dev/null; then
            pkill cvlc
            echo '{ "action": "stopped", "success": true }'
        else
            echo '{ "action": "toggle", "error": "No media file to resume", "success": false }'
        fi
        ;;
    "volume")
        VOLUME="$2"
        if [ -n "$VOLUME" ] && [ "$VOLUME" -ge 0 ] && [ "$VOLUME" -le 200 ]; then
            # For cvlc, we need to restart with new volume
            if pgrep -x cvlc > /dev/null; then
                echo '{ "action": "volume", "error": "Volume control requires restart for cvlc", "success": false }'
            else
                echo '{ "action": "volume", "error": "No cvlc process running", "success": false }'
            fi
        else
            echo '{ "action": "volume", "error": "Invalid volume level (0-200)", "success": false }'
        fi
        ;;
    *)
        echo '{ "error": "Invalid action. Use: status, play <file>, stop, toggle, volume <level>", "success": false }'
        ;;
esac