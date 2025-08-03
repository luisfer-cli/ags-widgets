#!/bin/bash

# Cava Audio Visualizer for Astal - Fixed Version
# Uses real cava integration with proper configuration

# Try to get real cava output
get_real_cava() {
    local config_file="/tmp/ags_cava_config"
    
    # Create optimized cava config for minimal CPU usage
    cat > "$config_file" << EOF
[general]
bars = 15
bar_width = 1
bar_spacing = 0
framerate = 20
sleep_timer = 1
autosens = 0
sensitivity = 1000

[input]
method = pulse
source = auto

[output]
method = raw
data_format = ascii
ascii_max_range = 8
bar_delimiter = 44
frame_delimiter = 10

[color]
gradient = 1
gradient_color_1 = '#5e81ac'
gradient_color_2 = '#88c0d0'

[smoothing]
noise_reduction = 70
monstercat = 0
waves = 0

[eq]
1 = 2
2 = 2
3 = 1
4 = 1
5 = 0
EOF

    # Get cava output - balance between speed and reliability
    timeout 1.2s cava -p "$config_file" 2>/dev/null | head -1 | sed 's/,$//' | tr -d '\n '
}

# Get real-time audio levels using pactl monitor
get_audio_levels() {
    if command -v pactl >/dev/null 2>&1; then
        # Get actual audio levels from PulseAudio monitor
        timeout 0.1s pactl list sinks | grep -A 15 "State: RUNNING" | grep "Volume:" | head -1 | grep -oP '\d+%' | head -1 | tr -d '%' || echo "0"
    else
        echo "0"
    fi
}

# Fallback simulation with better audio detection
get_simulated_cava() {
    local volume=0
    local playing=0
    local audio_level=0
    
    # Get volume
    if command -v pamixer >/dev/null 2>&1; then
        volume=$(pamixer --get-volume 2>/dev/null || echo "0")
    elif command -v pactl >/dev/null 2>&1; then
        volume=$(pactl get-sink-volume @DEFAULT_SINK@ 2>/dev/null | grep -oP '\d+%' | head -1 | tr -d '%' || echo "0")
    fi
    
    # Check if audio is playing
    if command -v pactl >/dev/null 2>&1; then
        playing=$(pactl list short sink-inputs 2>/dev/null | wc -l)
    fi
    
    # Get actual audio activity level
    audio_level=$(get_audio_levels)
    
    # Generate bars based on real conditions
    local bars=()
    local timestamp=$(date +%s%N)
    local base_scale=$((timestamp / 50000000))  # Faster animation
    
    for i in {0..19}; do
        if [ "$playing" -gt 0 ]; then
            # Active audio - use volume and add realistic variation
            local base_height=$((volume * 8 / 100))  # Scale to 0-8
            local wave_offset=$((base_scale + i * 3))
            local wave=$((wave_offset % 12))
            local wave_height=0
            
            # Create more realistic audio wave pattern
            case $((wave % 4)) in
                0) wave_height=$((RANDOM % 4)) ;;
                1) wave_height=$((2 + RANDOM % 3)) ;;
                2) wave_height=$((4 + RANDOM % 4)) ;;
                3) wave_height=$((1 + RANDOM % 3)) ;;
            esac
            
            # Combine base volume with wave
            local total=$((base_height + wave_height))
            
            # Add some bass/treble simulation
            if [ $((i % 5)) -eq 0 ]; then
                total=$((total + RANDOM % 3))  # Bass boost
            elif [ $((i % 7)) -eq 0 ]; then
                total=$((total + RANDOM % 2))  # Treble
            fi
            
            # Clamp to 0-10
            total=$((total > 10 ? 10 : total))
            total=$((total < 1 ? 1 : total))  # Minimum 1 when playing
            
            bars+=($total)
        else
            # No audio - minimal idle animation
            local idle_wave=$(((base_scale + i * 2) % 30))
            local height=0
            
            if [ $idle_wave -lt 3 ]; then
                height=1
            elif [ $idle_wave -lt 6 ]; then
                height=$((RANDOM % 2))
            else
                height=0
            fi
            
            bars+=($height)
        fi
    done
    
    echo "$(IFS=,; echo "${bars[*]}")"
}

# Main execution
main() {
    local bars=""
    local method="simulated"
    
    # Try real cava first if installed
    if command -v cava >/dev/null 2>&1; then
        bars=$(get_real_cava)
        # Check if we got valid numeric output
        if [ -n "$bars" ] && [[ "$bars" =~ ^[0-9,]+$ ]]; then
            method="cava"
        else
            # Fallback to simulation
            bars=$(get_simulated_cava)
            method="simulated"
        fi
    else
        # No cava available, use simulation
        bars=$(get_simulated_cava)
        method="simulated"
    fi
    
    # Ensure we have valid output with exactly 15 bars
    if [ -z "$bars" ]; then
        bars="0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
    else
        # Take only first 15 values if we have more
        bars=$(echo "$bars" | cut -d',' -f1-15)
        # Count commas to verify we have 15 values
        comma_count=$(echo "$bars" | tr -cd ',' | wc -c)
        if [ "$comma_count" -lt 14 ]; then
            # Pad with zeros if we have fewer than 15 values
            while [ "$comma_count" -lt 14 ]; do
                bars="$bars,0"
                comma_count=$((comma_count + 1))
            done
        fi
    fi
    
    # Get additional info
    local volume=0
    local playing=0
    
    if command -v pamixer >/dev/null 2>&1; then
        volume=$(pamixer --get-volume 2>/dev/null || echo "0")
    fi
    
    if command -v pactl >/dev/null 2>&1; then
        playing=$(pactl list short sink-inputs 2>/dev/null | wc -l)
    fi
    
    # Output JSON
    printf '{"bars": [%s], "volume": %d, "playing": %d, "method": "%s"}' "$bars" "$volume" "$playing" "$method"
}

main "$@"