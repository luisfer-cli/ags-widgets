#!/bin/bash
# File finder script for different search types

search_term="$1"
search_type="${2:-home}"  # home, config, root

case "$search_type" in
    "home")
        home_dir=$(echo $HOME)
        find "$home_dir" -name "*$search_term*" -type f 2>/dev/null | head -20
        ;;
    "config")
        find "$HOME/.config" -name "*$search_term*" -type f 2>/dev/null | head -20
        ;;
    "root")
        find / -name "*$search_term*" -type f 2>/dev/null | head -20
        ;;
    *)
        echo "Usage: $0 <search_term> [home|config|root]"
        exit 1
        ;;
esac