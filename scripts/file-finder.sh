#!/bin/bash
# File finder script using fd (fast alternative to find)

search_term="$1"
search_type="${2:-home}"  # home, config, root

# Check if fd is available
if ! command -v fd &> /dev/null; then
    echo "Error: fd command not found. Please install fd-find package." >&2
    exit 1
fi

# Auto-detect regex patterns
is_regex() {
    # Check for common regex patterns - escape special characters for bash
    if [[ "$1" =~ \. ]] || [[ "$1" =~ \* ]] || [[ "$1" =~ \+ ]] || [[ "$1" =~ \? ]] || \
       [[ "$1" =~ \^ ]] || [[ "$1" =~ \$ ]] || [[ "$1" =~ \[ ]] || [[ "$1" =~ \] ]] || \
       [[ "$1" =~ \{ ]] || [[ "$1" =~ \} ]] || [[ "$1" =~ \( ]] || [[ "$1" =~ \) ]] || \
       [[ "$1" =~ \| ]] || [[ "$1" =~ \\ ]]; then
        return 0  # true - is regex
    fi
    return 1  # false - not regex
}

# Set fd options based on pattern type
if is_regex "$search_term"; then
    search_flags="--type f --regex --ignore-case"
else
    search_flags="--type f --ignore-case"
fi

case "$search_type" in
    "home")
        home_dir=$(echo $HOME)
        # Use fd with auto-detected regex support
        fd $search_flags --max-results 50 "$search_term" "$home_dir" 2>/dev/null
        ;;
    "config")
        # Search in .config directory with hidden files included
        fd $search_flags --hidden --max-results 30 "$search_term" "$HOME/.config" 2>/dev/null
        ;;
    "root")
        # Root search with sudo, limited results for performance
        sudo fd $search_flags --max-results 20 "$search_term" "/" 2>/dev/null
        ;;
    *)
        echo "Usage: $0 <search_term> [home|config|root]"
        exit 1
        ;;
esac