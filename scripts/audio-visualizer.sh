#!/bin/bash
# Audio visualizer script using cava output for AGS

# Configuration
BARS=12
TIMEOUT=0.3

# Function to get audio levels from cava
get_audio_levels() {
    # Create temporary config for cava
    local temp_config=$(mktemp)
    cat > "$temp_config" <<EOF
[general]
framerate = 30
bars = $BARS
sleep_timer = 0

[input]
method = pulse
source = auto

[output] 
method = raw
raw_target = /dev/stdout
data_format = ascii
ascii_max_range = 100
bar_delimiter = 32

[smoothing]
monstercat = 1
waves = 0
noise_reduction = 0.77
EOF

    # Run cava with timeout and get first line of output
    timeout $TIMEOUT cava -p "$temp_config" 2>/dev/null | head -n 1
    rm -f "$temp_config"
}

# Function to format output as JSON
format_json_output() {
    local levels="$1"
    if [ -z "$levels" ] || [ "$levels" = "0" ]; then
        # Silent/no audio - return zeros
        local zero_array=""
        for i in $(seq 1 $BARS); do
            zero_array="${zero_array}0"
            if [ $i -lt $BARS ]; then
                zero_array="${zero_array},"
            fi
        done
        echo "{\"bars\":[$zero_array],\"max\":0,\"active\":false}"
    else
        # Convert space-separated values to comma-separated JSON array
        local json_array=$(echo "$levels" | tr ' ' ',' | sed 's/,$//')
        local max_val=$(echo "$levels" | tr ' ' '\n' | sort -nr | head -1)
        local is_active=$([ "$max_val" -gt 5 ] && echo "true" || "false")
        echo "{\"bars\":[$json_array],\"max\":$max_val,\"active\":$is_active}"
    fi
}

# Fallback function using pactl for basic audio detection
get_basic_audio_info() {
    # Get default sink volume as a simple fallback
    local volume=$(pactl get-sink-volume @DEFAULT_SINK@ 2>/dev/null | grep -oP '\d+(?=%)' | head -1)
    if [ -n "$volume" ] && [ "$volume" -gt 0 ]; then
        # Generate some fake bars based on volume
        local fake_data=""
        for i in $(seq 1 $BARS); do
            local val=$((volume / 2 + RANDOM % 20))
            fake_data="${fake_data}$val"
            if [ $i -lt $BARS ]; then
                fake_data="${fake_data} "
            fi
        done
        format_json_output "$fake_data"
    else
        format_json_output ""
    fi
}

# Main execution
case "$1" in
    "get-levels")
        # Try cava first, fallback to basic audio info
        if command -v cava >/dev/null 2>&1; then
            levels=$(get_audio_levels)
            if [ -n "$levels" ]; then
                format_json_output "$levels"
            else
                get_basic_audio_info
            fi
        else
            get_basic_audio_info
        fi
        ;;
    "test")
        # Test mode - generate fake data
        fake_data=""
        for i in $(seq 1 $BARS); do
            val=$((RANDOM % 80 + 10))
            fake_data="${fake_data}$val"
            if [ $i -lt $BARS ]; then
                fake_data="${fake_data} "
            fi
        done
        format_json_output "$fake_data"
        ;;
    *)
        echo "Usage: $0 {get-levels|test}"
        echo "Example output: {\"bars\":[12,34,56,23,45,67,89,12,34,56,78,90],\"max\":90,\"active\":true}"
        exit 1
        ;;
esac