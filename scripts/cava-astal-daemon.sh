#!/bin/bash

# Ultra-efficient Cava daemon that writes to a temporary file
# This avoids starting/stopping cava repeatedly

CAVA_OUTPUT_FILE="/tmp/ags_cava_output"
CAVA_CONFIG_FILE="/tmp/ags_cava_daemon_config"
CAVA_PID_FILE="/tmp/ags_cava_daemon.pid"

# Create optimized config for daemon mode
create_daemon_config() {
    cat > "$CAVA_CONFIG_FILE" << EOF
[general]
bars = 15
bar_width = 1
bar_spacing = 0
framerate = 15
sleep_timer = 1
autosens = 0
sensitivity = 800

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
gradient_color_1 = '#ffffff'
gradient_color_2 = '#000000'

[smoothing]
noise_reduction = 60
monstercat = 0
waves = 0

[eq]
1 = 2
2 = 2
3 = 1
4 = 1
5 = 0
EOF
}

# Start cava daemon if not running
start_daemon() {
    if [ -f "$CAVA_PID_FILE" ] && kill -0 $(cat "$CAVA_PID_FILE") 2>/dev/null; then
        return 0  # Already running
    fi
    
    create_daemon_config
    
    # Start cava in background, writing to output file
    cava -p "$CAVA_CONFIG_FILE" > "$CAVA_OUTPUT_FILE" 2>/dev/null &
    echo $! > "$CAVA_PID_FILE"
    
    # Wait a moment for cava to start
    sleep 0.5
}

# Stop cava daemon
stop_daemon() {
    if [ -f "$CAVA_PID_FILE" ]; then
        kill $(cat "$CAVA_PID_FILE") 2>/dev/null
        rm -f "$CAVA_PID_FILE" "$CAVA_OUTPUT_FILE" "$CAVA_CONFIG_FILE"
    fi
}

# Get latest cava output from file
get_cava_output() {
    if [ -f "$CAVA_OUTPUT_FILE" ]; then
        # Get the last line from the output file
        tail -1 "$CAVA_OUTPUT_FILE" 2>/dev/null | sed 's/,$//' | tr -d '\n '
    else
        echo ""
    fi
}

# Fallback simulation (simplified version)
get_simulated_output() {
    local playing=0
    
    if command -v pactl >/dev/null 2>&1; then
        playing=$(pactl list short sink-inputs 2>/dev/null | wc -l)
    fi
    
    if [ "$playing" -gt 0 ]; then
        echo "1,2,3,2,1,0,1,2,1,0,0,1,2,3,1"
    else
        echo "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
    fi
}

# Handle script arguments
case "${1:-run}" in
    "start")
        start_daemon
        echo "Cava daemon started"
        ;;
    "stop")
        stop_daemon
        echo "Cava daemon stopped"
        ;;
    "restart")
        stop_daemon
        sleep 1
        start_daemon
        echo "Cava daemon restarted"
        ;;
    "run"|*)
        # Default behavior - ensure daemon is running and get output
        bars=""
        method="simulated"
        
        if command -v cava >/dev/null 2>&1; then
            start_daemon
            bars=$(get_cava_output)
            
            if [ -n "$bars" ] && [[ "$bars" =~ ^[0-9,]+$ ]]; then
                method="cava-daemon"
                # Ensure exactly 15 values
                bars=$(echo "$bars" | cut -d',' -f1-15)
                comma_count=$(echo "$bars" | tr -cd ',' | wc -c)
                while [ "$comma_count" -lt 14 ]; do
                    bars="$bars,0"
                    comma_count=$((comma_count + 1))
                done
            else
                bars=$(get_simulated_output)
            fi
        else
            bars=$(get_simulated_output)
        fi
        
        # Get additional info
        volume=0
        playing=0
        
        if command -v pamixer >/dev/null 2>&1; then
            volume=$(pamixer --get-volume 2>/dev/null || echo "0")
        fi
        
        if command -v pactl >/dev/null 2>&1; then
            playing=$(pactl list short sink-inputs 2>/dev/null | wc -l)
        fi
        
        # Output JSON
        printf '{"bars": [%s], "volume": %d, "playing": %d, "method": "%s"}' "$bars" "$volume" "$playing" "$method"
        ;;
esac