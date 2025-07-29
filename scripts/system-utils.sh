#!/bin/bash
# System utilities script

case "$1" in
    "copy-to-clipboard")
        # Copy text to clipboard (works with both Wayland and X11)
        text="$2"
        if command -v wl-copy &> /dev/null; then
            echo "$text" | wl-copy
        elif command -v xclip &> /dev/null; then
            echo "$text" | xclip -selection clipboard
        else
            echo "No clipboard utility found"
            exit 1
        fi
        ;;
    "open-file")
        # Open file with default application
        xdg-open "$2"
        ;;
    "get-home")
        # Get home directory
        echo $HOME
        ;;
    "create-dir")
        # Create directory if it doesn't exist
        mkdir -p "$2"
        ;;
    *)
        echo "Usage: $0 {copy-to-clipboard|open-file|get-home|create-dir} [args...]"
        exit 1
        ;;
esac