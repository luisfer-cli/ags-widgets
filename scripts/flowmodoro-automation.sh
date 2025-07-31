#!/bin/bash

# FlowModoro Automation Hub - Ultimate Integration Controller
# Handles automatic workflows and smart task management

set -euo pipefail

AUTOMATION_LOG="/tmp/flowmodoro_automation.log"
HOOKS_DIR="/tmp/flowmodoro_hooks"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [AUTOMATION] $1" >> "$AUTOMATION_LOG"
}

init_automation() {
    mkdir -p "$HOOKS_DIR"
    log "Flowmodoro automation system initialized"
}

# Smart workflow: start session with best task
auto_start_optimal_session() {
    log "Starting optimal session selection..."
    
    # Get intelligent task recommendation
    local recommended_task
    recommended_task=$(bash scripts/flowmodoro-integration.sh recommend)
    
    if [ -n "$recommended_task" ]; then
        log "Auto-selected task: $recommended_task"
        
        # Start integrated session
        bash scripts/flowmodoro-integration.sh start "$recommended_task"
        
        # Create session hook for monitoring
        echo "$recommended_task" > "$HOOKS_DIR/current_session.txt"
        echo "$(date -Iseconds)" > "$HOOKS_DIR/session_start.txt"
        
        # Send notification
        notify-send "🍅 FlowModoro" "Started optimal session: $(task _get "$recommended_task".description 2>/dev/null || echo "Task $recommended_task")" --urgency=normal
        
        log "Optimal session started successfully"
    else
        log "No optimal task found, starting general session"
        bash scripts/flowmodoro-integration.sh start
        notify-send "🍅 FlowModoro" "Started general focus session" --urgency=low
    fi
}

# Auto-break management with intelligent suggestions
handle_break_intelligence() {
    local session_duration="$1"
    local completed_task="$2"
    
    log "Processing break intelligence for ${session_duration}min session"
    
    # Generate session report
    local session_report
    session_report=$(bash scripts/task-intelligence.sh report "$(cat "$HOOKS_DIR/session_start.txt" 2>/dev/null || echo "today")" "now" "$completed_task")
    
    # Calculate break duration based on session quality
    local break_duration=5
    if [[ "$session_duration" -ge 45 ]]; then
        break_duration=15
    elif [[ "$session_duration" -ge 25 ]]; then
        break_duration=10
    fi
    
    # Get next task suggestion
    local next_task
    next_task=$(bash scripts/flowmodoro-integration.sh recommend)
    
    # Create break notification with next steps
    local break_message="Break time! ($break_duration min)"
    if [ -n "$next_task" ]; then
        local next_task_desc
        next_task_desc=$(task _get "$next_task".description 2>/dev/null || echo "Next task")
        break_message="$break_message\nNext: $next_task_desc"
    fi
    
    notify-send "🌸 Break Time" "$break_message" --urgency=normal
    
    # Schedule automatic next session suggestion
    (sleep $((break_duration * 60)) && suggest_next_session "$next_task") &
    
    log "Break intelligence processed - $break_duration min break scheduled"
}

# Suggest next session after break
suggest_next_session() {
    local suggested_task="$1"
    
    if [ -n "$suggested_task" ]; then
        local task_desc
        task_desc=$(task _get "$suggested_task".description 2>/dev/null || echo "Next task")
        
        notify-send "🚀 Ready to Continue?" "Start next session: $task_desc\nClick to auto-start!" \
            --urgency=normal \
            --action="start=Start Session"
        
        log "Next session suggested: $suggested_task"
    fi
}

# Daily productivity insights
generate_daily_insights() {
    log "Generating daily productivity insights..."
    
    local analytics
    analytics=$(bash scripts/task-intelligence.sh analytics)
    
    local completed_today
    local focus_time
    local productivity_score
    
    completed_today=$(echo "$analytics" | jq -r '.analytics.completed_today' 2>/dev/null || echo "0")
    focus_time=$(echo "$analytics" | jq -r '.analytics.productivity.today_tracked' 2>/dev/null || echo "0:00:00")
    
    # Calculate simple productivity score
    local focus_minutes
    focus_minutes=$(echo "$focus_time" | awk -F: '{print ($1 * 60) + $2}')
    productivity_score=$(echo "scale=0; ($completed_today * 20) + ($focus_minutes / 3)" | bc 2>/dev/null || echo "0")
    
    # Generate insights message
    local insights_message="📊 Daily Summary:\n"
    insights_message="${insights_message}✅ $completed_today tasks completed\n"
    insights_message="${insights_message}⏱️ $focus_time focused\n"
    insights_message="${insights_message}📈 Productivity: $productivity_score%"
    
    # Add recommendations
    local recommendations
    recommendations=$(echo "$analytics" | jq -r '.recommendations[]' 2>/dev/null | head -3 | tr '\n' '\n• ' || echo "")
    if [ -n "$recommendations" ]; then
        insights_message="${insights_message}\n\n💡 Tips:\n• $recommendations"
    fi
    
    notify-send "🎯 Productivity Insights" "$insights_message" --urgency=low
    
    log "Daily insights generated - Score: $productivity_score%"
}

# Smart task creation based on patterns
auto_create_tasks() {
    local context="${1:-}"
    
    case "$context" in
        "morning")
            # Create morning routine tasks
            bash scripts/task-intelligence.sh create "Review daily priorities" "H" "planning" "15min"
            bash scripts/task-intelligence.sh create "Check urgent emails" "M" "communication" "10min"
            log "Morning routine tasks created"
            ;;
        "evening")
            # Create evening review tasks
            bash scripts/task-intelligence.sh create "Review today's accomplishments" "L" "planning" "10min"
            bash scripts/task-intelligence.sh create "Plan tomorrow's priorities" "M" "planning" "15min"
            log "Evening review tasks created"
            ;;
        "break")
            # Create quick break tasks
            bash scripts/task-intelligence.sh create "Quick email check" "L" "communication" "5min"
            bash scripts/task-intelligence.sh create "Stretch and hydrate" "L" "wellness" "5min"
            log "Break tasks created"
            ;;
    esac
}

# Emergency focus mode - clear distractions and start deep work
emergency_focus() {
    log "Activating emergency focus mode..."
    
    # Get most urgent task
    local urgent_task
    urgent_task=$(task +OVERDUE or priority:H limit:1 export 2>/dev/null | jq -r '.[0].id // empty' || echo "")
    
    if [ -z "$urgent_task" ]; then
        urgent_task=$(task status:pending priority:H limit:1 export 2>/dev/null | jq -r '.[0].id // empty' || echo "")
    fi
    
    if [ -n "$urgent_task" ]; then
        # Start emergency session
        bash scripts/flowmodoro-integration.sh start "$urgent_task"
        
        # Block distractions (example - customize as needed)
        # pkill -f firefox 2>/dev/null || true
        # pkill -f discord 2>/dev/null || true
        
        local task_desc
        task_desc=$(task _get "$urgent_task".description 2>/dev/null || echo "Urgent task")
        
        notify-send "🔥 EMERGENCY FOCUS" "Deep work mode activated!\nTask: $task_desc" --urgency=critical
        
        log "Emergency focus activated for task: $urgent_task"
    else
        notify-send "🔥 EMERGENCY FOCUS" "No urgent tasks found. Create one first!" --urgency=normal
        log "Emergency focus requested but no urgent tasks available"
    fi
}

# Background monitoring service
start_monitoring() {
    log "Starting background monitoring service..."
    
    while true; do
        # Check for completed pomodoros every 30 seconds
        if [ -f "$HOOKS_DIR/current_session.txt" ]; then
            local current_task
            current_task=$(cat "$HOOKS_DIR/current_session.txt")
            
            # Check if flowmodoro session ended
            local flowmodoro_status
            flowmodoro_status=$(flowmodoro.py status)
            
            if [[ "$flowmodoro_status" == "No active session." ]]; then
                # Session completed
                local session_start
                session_start=$(cat "$HOOKS_DIR/session_start.txt" 2>/dev/null || echo "$(date -Iseconds)")
                
                # Mark task as completed if it was finished
                if [ -n "$current_task" ] && task _get "$current_task".status 2>/dev/null | grep -q "completed"; then
                    handle_break_intelligence "25" "$current_task"
                else
                    handle_break_intelligence "25" ""
                fi
                
                # Cleanup session files
                rm -f "$HOOKS_DIR/current_session.txt" "$HOOKS_DIR/session_start.txt"
            fi
        fi
        
        sleep 30
    done
}

# Main command handler
case "${1:-help}" in
    "init")
        init_automation
        ;;
    "start-optimal")
        auto_start_optimal_session
        ;;
    "daily-insights")
        generate_daily_insights
        ;;
    "create-tasks")
        auto_create_tasks "${2:-}"
        ;;
    "emergency")
        emergency_focus
        ;;
    "monitor")
        start_monitoring
        ;;
    "help"|*)
        cat <<EOF
FlowModoro Automation Hub - Ultimate Productivity Integration

Commands:
  init                 - Initialize automation system
  start-optimal        - Auto-start session with best task
  daily-insights       - Generate productivity report
  create-tasks [ctx]   - Auto-create contextual tasks (morning/evening/break)
  emergency           - Activate emergency focus mode
  monitor             - Start background monitoring service
  help                - Show this help

Examples:
  $0 start-optimal     # Start optimized focus session
  $0 create-tasks morning  # Create morning routine
  $0 emergency         # Emergency deep work mode
  $0 monitor &         # Start background service
EOF
        ;;
esac