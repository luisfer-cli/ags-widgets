currentChessTime=$(timew summary +ajedrez today | grep -Eo '[0-9]+:[0-9]{2}:[0-9]{2}$' | tail -n 1)

IFS=':' read -r hours minutes seconds <<<"$currentChessTime"
seconds=$((hours * 3600 + minutes * 60 + seconds))
if [ "$seconds" -gt 5400 ]; then
    win=1
else
    win=0
fi

currentTask=$(timew)
task=$(echo "$currentTask" | awk '{print $2}' | head -n 1)

if [[ "$currentTask" == "There is no active time tracking." ]]; then
    if [ "$win" -eq 1 ]; then
        echo "{ \"current\": \"Ajedrez\", \"alt\": \"done\", \"time\":\"$currentChessTime\"}"
    else
        if ["$currentChessTime" == ""]; then
            echo "{ \"current\": \"Ajedrez\", \"alt\": \"pending\", \"time\":\"00:00:00\"}"
        else
            echo "{ \"current\": \"Ajedrez\", \"alt\": \"progress\", \"time\":\"$currentChessTime\"}"
            
        fi
    fi
elif [[ "$task" == "\"+ajedrez\"" ]]; then
    if [ "$win" -eq 1 ]; then
        echo "{ \"current\": \"Ajedrez+\", \"alt\": \"done\", \"time\":\"$currentChessTime\"}"
    else
        echo "{ \"current\": \"Ajedrez\", \"alt\": \"progress\", \"time\":\"$currentChessTime\"}"
    fi
else
    echo "{ \"current\": \"Ajedrez\", \"alt\": \"pending\", \"time\":\"$currentChessTime\"}"
fi
