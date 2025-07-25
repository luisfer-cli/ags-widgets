#!/bin/bash

current=$(/home/luisfer/.local/bin/flowmodoro.py status)

if [ "$current" = "No active session." ]; then
    currentChessTime=$(timew summary +programación today | grep -Eo '[0-9]+:[0-9]{2}:[0-9]{2}$' | tail -n 1)
    
    currentTask=$(timew)
    task=$(echo "$currentTask" | awk '{print $2}' | head -n 1)

    if [[ "$currentTask" == "There is no active time tracking." ]]; then
        if [[ $currentChessTime == "" ]]; then
            echo "{ \"current\": \"programacion\", \"alt\": \"pending\", \"time\":\"00:00:00\"}"
        else
            echo "{ \"current\": \"programacion\", \"alt\": \"progress\", \"time\":\"$currentChessTime\"}"
        fi
    else
        echo "{ \"current\": \"programacion\", \"alt\": \"pending\", \"time\":\"$currentChessTime\"}"
    fi
else
    mode=$(echo "$current" | awk -F '=' '/^mode=/{ print $2 }')
    if [ "$mode" = "work" ]; then
        time=$(echo "$current" | awk -F '=' '/^worked_hms=/{ print $2 }')
        echo "{\"time\": \"$time\", \"alt\": \"w\"}"
    else
        time=$(echo "$current" | awk -F '=' '/^remaining_hms=/{ print $2 }')
        echo "{\"time\": \"$time\", \"alt\": \"b\"}"
    fi
fi
