#!/bin/bash

# Audio visualizer using system volume levels and audio activity
# This provides a working alternative to cava

# Function to get current volume level
get_volume() {
    if command -v pamixer >/dev/null 2>&1; then
        pamixer --get-volume 2>/dev/null || echo "0"
    elif command -v pactl >/dev/null 2>&1; then
        pactl get-sink-volume @DEFAULT_SINK@ 2>/dev/null | grep -oP '\d+%' | head -1 | tr -d '%' || echo "0"
    else
        echo "50"  # Default fallback
    fi
}

# Function to detect if audio is playing
is_audio_playing() {
    if command -v pactl >/dev/null 2>&1; then
        # Check if any sink inputs are playing
        pactl list short sink-inputs 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

# Function to get audio device activity (simplified)
get_audio_activity() {
    local playing=$(is_audio_playing)
    local volume=$(get_volume)
    
    if [ "$playing" -gt 0 ]; then
        # Audio is playing, simulate based on volume
        echo "$volume"
    else
        # No audio playing
        echo "0"
    fi
}

# Generate visualization bars
generate_bars() {
    local activity=$1
    local bars=()
    local timestamp=$(date +%s%N)
    local base_scale=$((timestamp / 50000000))  # Slower animation
    
    for i in {0..19}; do
        if [ "$activity" -gt 0 ]; then
            # Audio is playing - create realistic visualization
            local wave_offset=$((base_scale + i * 3))
            local base_height=$((activity * 8 / 100))  # Scale volume to 0-8
            
            # Add wave pattern
            local wave=$((wave_offset % 20))
            local wave_height=0
            
            if [ $wave -lt 5 ]; then
                wave_height=$((wave * 2))
            elif [ $wave -lt 10 ]; then
                wave_height=$(((10 - wave) * 2))
            elif [ $wave -lt 15 ]; then
                wave_height=$((wave - 10))
            else
                wave_height=$((20 - wave))
            fi
            
            # Combine base volume with wave
            local total=$((base_height + wave_height / 3))
            
            # Add some randomness for realism
            local random_offset=$(((timestamp + i * 7) % 3))
            total=$((total + random_offset))
            
            # Clamp to 0-10
            total=$((total > 10 ? 10 : total))
            total=$((total < 0 ? 0 : total))
            
            bars+=($total)
        else
            # No audio - gentle idle animation
            local idle_wave=$(((base_scale + i * 2) % 30))
            local height=0
            
            if [ $idle_wave -lt 10 ]; then
                height=$((idle_wave / 5))
            elif [ $idle_wave -lt 20 ]; then
                height=$(((20 - idle_wave) / 5))
            fi
            
            height=$((height > 2 ? 2 : height))  # Max 2 for idle
            bars+=($height)
        fi
    done
    
    printf '{"bars": [%s], "volume": %d, "playing": %d}' "$(IFS=,; echo "${bars[*]}")" "$activity" "$playing"
}

# Main execution
activity=$(get_audio_activity)
playing=$(is_audio_playing)
generate_bars "$activity"