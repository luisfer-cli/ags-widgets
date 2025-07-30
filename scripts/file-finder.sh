#!/bin/bash
# File finder script using fd (fast alternative to find)

search_term="$1"
search_type="${2:-home}"  # home, config, root

# Check if fd is available
if ! command -v fd &> /dev/null; then
    echo "Error: fd command not found. Please install fd-find package." >&2
    exit 1
fi

case "$search_type" in
    "home")
        home_dir=$(echo $HOME)
        # Use fd with type file, max results 50 for better performance
        fd --type f --max-results 50 "$search_term" "$home_dir" 2>/dev/null
        ;;
    "config")
        # Search in .config directory with hidden files included
        fd --type f --hidden --max-results 30 "$search_term" "$HOME/.config" 2>/dev/null
        ;;
    "root")
        # Root search with sudo, limited results for performance
        sudo fd --type f --max-results 20 "$search_term" "/" 2>/dev/null
        ;;
    *)
        echo "Usage: $0 <search_term> [home|config|root]"
        exit 1
        ;;
esac