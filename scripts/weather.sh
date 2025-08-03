#!/bin/bash

# Simple weather script using wttr.in service
# Returns weather data in JSON format

# City (can be customized)
CITY="Barcelona"

# Get weather with minimal output
weather_data=$(curl -s "wttr.in/${CITY}?format=%C+%t+%w" --max-time 5 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$weather_data" ]; then
    # Parse the simple format: "Condition Temperature Wind"
    # Example: "Clear +22°C 5km/h"
    
    # Extract temperature (contains °C)
    temp=$(echo "$weather_data" | grep -o '[+-][0-9]*°C' | head -1)
    
    # Extract condition (first word)
    condition=$(echo "$weather_data" | awk '{print $1}')
    
    # Simple icon mapping
    case "$condition" in
        *Clear*|*Sunny*) icon="☀" ;;
        *Cloud*|*Overcast*) icon="☁" ;;
        *Rain*|*Drizzle*) icon="🌧" ;;
        *Snow*) icon="❄" ;;
        *Thunder*|*Storm*) icon="⛈" ;;
        *Fog*|*Mist*) icon="🌫" ;;
        *) icon="🌤" ;;
    esac
    
    # Output JSON
    echo "{\"temperature\":\"${temp:-+0°C}\",\"condition\":\"${condition:-Clear}\",\"icon\":\"${icon}\"}"
else
    # Fallback data
    echo "{\"temperature\":\"+--°C\",\"condition\":\"--\",\"icon\":\"🌤\"}"
fi