#!/bin/bash
# Get current media player status (artist and title)
if [ "$1" = "artist" ]; then
    playerctl metadata artist 2>/dev/null || echo ""
elif [ "$1" = "title" ]; then
    playerctl metadata title 2>/dev/null || echo ""
elif [ "$1" = "status" ]; then
    playerctl status 2>/dev/null || echo "Stopped"
else
    # Return combined info as JSON
    artist=$(playerctl metadata artist 2>/dev/null || echo "")
    title=$(playerctl metadata title 2>/dev/null || echo "")
    status=$(playerctl status 2>/dev/null || echo "Stopped")
    echo "{\"artist\":\"$artist\",\"title\":\"$title\",\"status\":\"$status\"}"
fi