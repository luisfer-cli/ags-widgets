#!/bin/bash

# Simple working cava script that actually captures audio
# Tests different approaches to get real audio data

# Create a test cava config
TEMP_CONFIG="/tmp/cava_test_$$"
cat > "$TEMP_CONFIG" << 'EOF'
[general]
bars = 20
sleep_timer = 1

[input]
method = pulse

[output]
method = raw
raw_target = /dev/stdout
data_format = ascii
ascii_max_range = 10
EOF

# Function to test if cava is working at all
test_cava() {
    echo "Testing cava with simple config..." >&2
    timeout 1s cava -p "$TEMP_CONFIG" 2>/dev/null | head -1 | {
        read line
        if [ -n "$line" ]; then
            echo "SUCCESS: Got cava output: ${line:0:10}..." >&2
            echo "$line"
            return 0
        else
            echo "FAILED: No output from cava" >&2
            return 1
        fi
    }
}

# Alternative: try without config file
test_cava_simple() {
    echo "Testing cava without config file..." >&2
    echo -e "bars = 20\nmethod = pulse\nraw_target = /dev/stdout\ndata_format = ascii" | timeout 0.5s cava 2>/dev/null | head -1 | {
        read line
        if [ -n "$line" ]; then
            echo "SUCCESS: Got simple cava output" >&2
            echo "$line"
            return 0
        else
            echo "FAILED: No simple output" >&2
            return 1
        fi
    }
}

# Main execution
if cava_output=$(test_cava); then
    echo "Using cava config approach" >&2
    # Process the output
    bars=()
    for ((i=0; i<20; i++)); do
        if [ $i -lt ${#cava_output} ]; then
            char="${cava_output:$i:1}"
            if [ -n "$char" ]; then
                height=$(printf "%d" "'$char" 2>/dev/null || echo "0")
                height=$((height % 11))
            else
                height=0
            fi
        else
            height=0
        fi
        bars+=($height)
    done
    printf '{"bars": [%s], "source": "cava"}' "$(IFS=,; echo "${bars[*]}")"
else
    echo "Cava failed, using fallback" >&2
    # Simple fallback that shows we're not getting real data
    echo '{"bars": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "source": "fallback", "error": "cava not working"}'
fi

# Cleanup
rm -f "$TEMP_CONFIG"