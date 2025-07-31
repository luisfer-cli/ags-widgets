#!/bin/bash

# Advanced Task Management Helper for FlowModoro Integration
# Provides smart task analytics and management features

set -euo pipefail

# Get task analytics and insights
get_task_analytics() {
    local completed_today
    local pending_tasks
    local overdue_tasks
    local high_priority
    local medium_priority
    local low_priority
    local no_priority
    local avg_completion_time
    local productivity_trend
    
    # Basic counts
    completed_today=$(task status:completed end.after:today count 2>/dev/null || echo "0")
    pending_tasks=$(task status:pending count 2>/dev/null || echo "0")
    overdue_tasks=$(task +OVERDUE count 2>/dev/null || echo "0")
    
    # Priority breakdown
    high_priority=$(task status:pending priority:H count 2>/dev/null || echo "0")
    medium_priority=$(task status:pending priority:M count 2>/dev/null || echo "0")
    low_priority=$(task status:pending priority:L count 2>/dev/null || echo "0")
    no_priority=$(task status:pending priority: count 2>/dev/null || echo "0")
    
    # Calculate productivity trend (last 7 days)
    local week_completion=0
    for i in {0..6}; do
        local day_completion
        day_completion=$(task status:completed end.after:"$(date -d "$i days ago" '+%Y-%m-%d')" end.before:"$(date -d "$((i-1)) days ago" '+%Y-%m-%d')" count 2>/dev/null || echo "0")
        week_completion=$((week_completion + day_completion))
    done
    
    local daily_avg
    daily_avg=$(echo "scale=1; $week_completion / 7" | bc 2>/dev/null || echo "0")
    
    # Time tracking insights
    local today_tracked
    today_tracked=$(timew summary today 2>/dev/null | grep -oE '[0-9]+:[0-9]+:[0-9]+' | head -1 || echo "0:00:00")
    
    # Generate insights
    local insights=()
    
    if [ "$overdue_tasks" -gt 0 ]; then
        insights+=("⚠️ $overdue_tasks overdue tasks need immediate attention")
    fi
    
    if [ "$high_priority" -gt 0 ]; then
        insights+=("🎯 $high_priority high-priority tasks waiting")
    fi
    
    if [ "$completed_today" -gt 0 ]; then
        insights+=("✅ $completed_today tasks completed today")
    fi
    
    if [ "$(echo "$daily_avg > 0" | bc 2>/dev/null || echo "0")" -eq 1 ]; then
        insights+=("📈 Averaging $daily_avg tasks per day this week")
    fi
    
    # Output JSON
    cat <<EOF
{
    "analytics": {
        "completed_today": $completed_today,
        "pending_tasks": $pending_tasks,
        "overdue_tasks": $overdue_tasks,
        "priority_breakdown": {
            "high": $high_priority,
            "medium": $medium_priority,
            "low": $low_priority,
            "none": $no_priority
        },
        "productivity": {
            "daily_average": "$daily_avg",
            "today_tracked": "$today_tracked",
            "week_completion": $week_completion
        }
    },
    "insights": [$(printf '"%s",' "${insights[@]}" | sed 's/,$//')],
    "recommendations": $(get_smart_recommendations)
}
EOF
}

# Generate smart task recommendations
get_smart_recommendations() {
    local recommendations=()
    local current_hour
    current_hour=$(date +%H)
    
    # Time-based recommendations
    if [ "$current_hour" -lt 12 ]; then
        recommendations+=("🌅 Morning focus: tackle high-priority tasks")
    elif [ "$current_hour" -lt 17 ]; then
        recommendations+=("☀️ Afternoon productivity: maintain momentum")
    else
        recommendations+=("🌆 Evening review: plan tomorrow's priorities")
    fi
    
    # Task-based recommendations
    local overdue_count
    overdue_count=$(task +OVERDUE count 2>/dev/null || echo "0")
    
    if [ "$overdue_count" -gt 0 ]; then
        recommendations+=("🔥 Clear overdue tasks first for better flow")
    fi
    
    local quick_tasks
    quick_tasks=$(task status:pending estimate.below:30min count 2>/dev/null || echo "0")
    
    if [ "$quick_tasks" -gt 0 ]; then
        recommendations+=("⚡ $quick_tasks quick wins available (under 30min)")
    fi
    
    # Focus time recommendations
    local today_focus
    today_focus=$(timew summary today 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "0")
    
    if [ "$today_focus" -lt 2 ]; then
        recommendations+=("🎯 Aim for 2+ hours of deep focus today")
    elif [ "$today_focus" -ge 4 ]; then
        recommendations+=("🏆 Excellent focus time! Consider a longer break")
    fi
    
    printf '[%s]' "$(printf '"%s",' "${recommendations[@]}" | sed 's/,$//')"
}

# Create a smart task based on context
create_smart_task() {
    local description="$1"
    local priority="${2:-M}"
    local project="${3:-}"
    local estimate="${4:-}"
    
    local task_cmd="task add \"$description\""
    
    if [ -n "$priority" ]; then
        task_cmd="$task_cmd priority:$priority"
    fi
    
    if [ -n "$project" ]; then
        task_cmd="$task_cmd project:$project"
    fi
    
    if [ -n "$estimate" ]; then
        task_cmd="$task_cmd estimate:$estimate"
    fi
    
    # Auto-assign due date based on priority
    case "$priority" in
        "H")
            task_cmd="$task_cmd due:today"
            ;;
        "M")
            task_cmd="$task_cmd due:3days"
            ;;
        "L")
            task_cmd="$task_cmd due:1week"
            ;;
    esac
    
    eval "$task_cmd"
    echo "Smart task created with priority $priority"
}

# Auto-organize tasks based on patterns
auto_organize_tasks() {
    # Auto-assign projects based on keywords
    task /code/ modify project:development 2>/dev/null || true
    task /bug/ modify project:development 2>/dev/null || true
    task /meeting/ modify project:communication 2>/dev/null || true
    task /email/ modify project:communication 2>/dev/null || true
    task /learning/ modify project:growth 2>/dev/null || true
    task /course/ modify project:growth 2>/dev/null || true
    
    # Auto-assign priorities based on keywords
    task /urgent/ modify priority:H 2>/dev/null || true
    task /important/ modify priority:H 2>/dev/null || true
    task /review/ modify priority:L 2>/dev/null || true
    task /cleanup/ modify priority:L 2>/dev/null || true
    
    echo "Tasks auto-organized based on patterns"
}

# Generate focus session report
generate_focus_report() {
    local session_start="$1"
    local session_end="$2"
    local task_id="${3:-}"
    
    # Calculate session duration
    local duration
    duration=$(timew summary "$session_start" - "$session_end" 2>/dev/null | grep -oE '[0-9]+:[0-9]+:[0-9]+' | head -1 || echo "0:00:00")
    
    # Get tasks worked on
    local tasks_worked=""
    if [ -n "$task_id" ]; then
        tasks_worked=$(task _get "$task_id".description 2>/dev/null || echo "Unknown Task")
    fi
    
    # Generate insights
    local session_minutes
    session_minutes=$(echo "$duration" | awk -F: '{print ($1 * 60) + $2}')
    
    local quality_score
    if [ "$session_minutes" -ge 25 ]; then
        quality_score="Excellent"
    elif [ "$session_minutes" -ge 15 ]; then
        quality_score="Good"
    else
        quality_score="Needs Improvement"
    fi
    
    cat <<EOF
{
    "session_report": {
        "duration": "$duration",
        "quality": "$quality_score",
        "tasks_worked": "$tasks_worked",
        "focus_score": $(echo "scale=0; $session_minutes * 4 / 100" | bc 2>/dev/null || echo "0"),
        "recommendations": [
            "$([ "$session_minutes" -lt 25 ] && echo "Try to extend focus sessions to 25+ minutes" || echo "Great focus session length!")",
            "$([ -n "$tasks_worked" ] && echo "Good task tracking" || echo "Consider linking sessions to specific tasks")"
        ]
    }
}
EOF
}

# Main command handler
case "${1:-analytics}" in
    "analytics")
        get_task_analytics
        ;;
    "create")
        create_smart_task "${2:-New Task}" "${3:-M}" "${4:-}" "${5:-}"
        ;;
    "organize")
        auto_organize_tasks
        ;;
    "report")
        generate_focus_report "${2:-today}" "${3:-now}" "${4:-}"
        ;;
    "recommendations")
        get_smart_recommendations
        ;;
    *)
        echo "Usage: $0 {analytics|create [desc] [priority] [project] [estimate]|organize|report [start] [end] [task_id]|recommendations}"
        exit 1
        ;;
esac