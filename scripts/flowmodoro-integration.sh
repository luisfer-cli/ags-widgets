#!/bin/bash

# Flowmodoro Integration Script - Intelligent Task & Time Management
# Seamlessly integrates taskwarrior, timewarrior, and flowmodoro.py

set -euo pipefail

FLOWMODORO_STATE_FILE="/tmp/flowmodoro_state.json"
INTEGRATION_LOG="/tmp/flowmodoro_integration.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$INTEGRATION_LOG"
}

# Get current flowmodoro status with enhanced data
get_flowmodoro_status() {
    local status_output
    status_output=$(flowmodoro.py status 2>/dev/null || echo "No active session.")
    
    local current_task=""
    local active_timew=""
    
    # Get current timewarrior session
    if timew get dom.active.count 2>/dev/null | grep -q "1"; then
        active_timew=$(timew get dom.active.tag.1 2>/dev/null || echo "")
    fi
    
    # Get current taskwarrior active task
    current_task=$(task +ACTIVE export 2>/dev/null | jq -r '.[0].description // ""' 2>/dev/null || echo "")
    
    # Calculate productivity metrics
    local today_focus_time
    today_focus_time=$(timew summary today 2>/dev/null | grep -oE '[0-9]+:[0-9]+:[0-9]+' | head -1 || echo "0:00:00")
    
    # Get task priority and urgency for smart suggestions
    local high_priority_tasks
    high_priority_tasks=$(task status:pending priority:H count 2>/dev/null || echo "0")
    
    local overdue_tasks
    overdue_tasks=$(task +OVERDUE count 2>/dev/null || echo "0")
    
    cat > "$FLOWMODORO_STATE_FILE" <<EOF
{
    "flowmodoro_status": "$status_output",
    "current_task": "$current_task",
    "active_timewarrior": "$active_timew",
    "today_focus_time": "$today_focus_time",
    "high_priority_tasks": $high_priority_tasks,
    "overdue_tasks": $overdue_tasks,
    "suggestion": "$(get_smart_suggestion)",
    "productivity_score": $(calculate_productivity_score),
    "last_updated": "$(date -Iseconds)"
}
EOF
    
    cat "$FLOWMODORO_STATE_FILE"
}

# Intelligent task suggestion based on context
get_smart_suggestion() {
    local overdue_count
    local high_priority_count
    local active_timew
    
    overdue_count=$(task +OVERDUE count 2>/dev/null || echo "0")
    high_priority_count=$(task status:pending priority:H count 2>/dev/null || echo "0")
    active_timew=$(timew get dom.active.count 2>/dev/null || echo "0")
    
    if [ "$overdue_count" -gt 0 ]; then
        echo "⚠️ Focus on overdue tasks ($overdue_count pending)"
    elif [ "$high_priority_count" -gt 0 ]; then
        echo "🎯 High priority tasks available ($high_priority_count)"
    elif [ "$active_timew" -eq 0 ]; then
        echo "▶️ Start tracking time for better insights"
    else
        echo "🚀 Keep up the great work!"
    fi
}

# Calculate productivity score (0-100)
calculate_productivity_score() {
    local completed_today
    local focus_minutes
    local overdue_penalty
    
    completed_today=$(task status:completed end.after:today count 2>/dev/null || echo "0")
    
    # Convert focus time to minutes
    local focus_time
    focus_time=$(timew summary today 2>/dev/null | grep -oE '[0-9]+:[0-9]+:[0-9]+' | head -1 || echo "0:00:00")
    focus_minutes=$(echo "$focus_time" | awk -F: '{print ($1 * 60) + $2}')
    
    overdue_penalty=$(task +OVERDUE count 2>/dev/null || echo "0")
    
    # Basic scoring algorithm
    local score=$((completed_today * 20 + focus_minutes / 5 - overdue_penalty * 10))
    
    # Cap between 0-100
    if [ "$score" -lt 0 ]; then
        score=0
    elif [ "$score" -gt 100 ]; then
        score=100
    fi
    
    echo "$score"
}

# Start intelligent flowmodoro session
start_intelligent_session() {
    local task_id="$1"
    local task_description
    
    if [ -n "$task_id" ]; then
        task_description=$(task _get "$task_id".description 2>/dev/null || echo "Unknown Task")
        
        # Start timewarrior tracking
        timew start "$task_description" "flowmodoro" 2>/dev/null || true
        
        # Mark task as active
        task "$task_id" modify +ACTIVE 2>/dev/null || true
        
        log "Started intelligent session for task: $task_description"
    fi
    
    # Start flowmodoro
    flowmodoro.py start &
    
    log "Flowmodoro session started with full integration"
}

# End session and update all systems
end_session() {
    # Stop timewarrior if active
    if timew get dom.active.count 2>/dev/null | grep -q "1"; then
        timew stop 2>/dev/null || true
        log "Stopped timewarrior tracking"
    fi
    
    # Remove ACTIVE tag from all tasks
    task +ACTIVE modify -ACTIVE 2>/dev/null || true
    
    log "Session ended, all systems updated"
}

# Get smart task recommendation
get_recommended_task() {
    # Priority algorithm: overdue > high priority > due soon > longest not worked on
    local recommended_task
    
    # First check overdue
    recommended_task=$(task +OVERDUE export 2>/dev/null | jq -r '.[0].id // empty' 2>/dev/null)
    
    if [ -z "$recommended_task" ]; then
        # Then high priority
        recommended_task=$(task status:pending priority:H export 2>/dev/null | jq -r '.[0].id // empty' 2>/dev/null)
    fi
    
    if [ -z "$recommended_task" ]; then
        # Then due soon
        recommended_task=$(task due.before:3days status:pending export 2>/dev/null | jq -r '.[0].id // empty' 2>/dev/null)
    fi
    
    if [ -z "$recommended_task" ]; then
        # Finally, any pending task
        recommended_task=$(task status:pending export 2>/dev/null | jq -r '.[0].id // empty' 2>/dev/null)
    fi
    
    echo "$recommended_task"
}

# Main command handler
case "${1:-status}" in
    "status")
        get_flowmodoro_status
        ;;
    "start")
        task_id="${2:-$(get_recommended_task)}"
        start_intelligent_session "$task_id"
        ;;
    "stop"|"break")
        end_session
        flowmodoro.py break 2>/dev/null || true
        ;;
    "recommend")
        get_recommended_task
        ;;
    *)
        echo "Usage: $0 {status|start [task_id]|stop|break|recommend}"
        exit 1
        ;;
esac