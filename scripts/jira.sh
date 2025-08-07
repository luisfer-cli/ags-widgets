#!/bin/bash

# Jira data fetcher script
# Requires JIRA_URL, JIRA_USER, and JIRA_TOKEN environment variables
# Returns JSON with Jira issues and status

# Default fallback data
fallback_data() {
    echo '{
        "issues": [],
        "total": 0,
        "status": "error",
        "message": "Jira not configured"
    }'
}

# Check if Jira credentials are configured
if [[ -z "$JIRA_URL" || -z "$JIRA_USER" || -z "$JIRA_TOKEN" ]]; then
    fallback_data
    exit 0
fi

# Jira API endpoint for current user's issues
ENDPOINT="${JIRA_URL}/rest/api/2/search"

# JQL query for assigned issues (In Progress, To Do, In Review)
JQL="assignee=currentUser() AND status IN ('To Do', 'In Progress', 'In Review') ORDER BY priority DESC, updated DESC"

# Make API request
response=$(curl -s \
    -u "${JIRA_USER}:${JIRA_TOKEN}" \
    -H "Accept: application/json" \
    -G \
    --data-urlencode "jql=${JQL}" \
    --data-urlencode "maxResults=5" \
    --data-urlencode "fields=key,summary,status,priority,assignee" \
    "${ENDPOINT}" 2>/dev/null)

# Check if request was successful
if [[ $? -ne 0 || -z "$response" ]]; then
    fallback_data
    exit 0
fi

# Parse and format response
echo "$response" | jq -c '{
    issues: .issues | map({
        key: .key,
        summary: .fields.summary,
        status: .fields.status.name,
        priority: .fields.priority.name // "Medium"
    }),
    total: .total,
    status: "success",
    message: "Connected to Jira"
}' 2>/dev/null || fallback_data