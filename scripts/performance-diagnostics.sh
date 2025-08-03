#!/bin/bash

# Performance diagnostics script
# Shows system impact and performance stats

echo "🔍 AGS Performance Diagnostics"
echo "=============================="

# Check current AGS processes
echo "📊 Current Process Usage:"
ps aux | grep -E "(ags|gjs|cava)" | grep -v grep | while read line; do
    echo "  $line"
done

echo ""

# Check memory usage
echo "🧠 Memory Usage:"
echo "  $(free -h | grep Mem)"

echo ""

# Check CPU load
echo "⚡ CPU Load:"
echo "  $(uptime)"

echo ""

# Check active timers (approximation)
echo "⏰ Active Polling Processes:"
echo "  Cava daemon: $(pgrep -f cava-astal-daemon || echo 'Not running')"
echo "  AGS processes: $(pgrep -f ags | wc -l)"

echo ""

# Check file handles
echo "📁 Open File Handles (AGS):"
ags_pid=$(pgrep -f 'gjs.*ags' | head -1)
if [ -n "$ags_pid" ]; then
    echo "  AGS PID: $ags_pid"
    echo "  Open files: $(lsof -p $ags_pid 2>/dev/null | wc -l)"
else
    echo "  AGS not running"
fi

echo ""
echo "✅ Diagnostics complete"