#!/bin/bash

# Get WPM data from tmp file and return as JSON
wpm_value=$(cat /tmp/current_wpm.txt 2>/dev/null || echo "0")
echo "{ \"wpm\": \"$wpm_value\" }"
