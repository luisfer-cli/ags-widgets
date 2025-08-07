/**
 * Jira Issues Widget - Displays assigned issues from Jira (Compact Version)
 * Shows current user's To Do, In Progress, and In Review issues
 */
import { Gtk } from "ags/gtk4";
import { With } from "ags";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS } from "../../config/constants";

interface JiraIssue {
    key: string;
    summary: string;
    status: string;
    priority: string;
}

interface JiraData {
    issues: JiraIssue[];
    total: number;
    status: string;
    message: string;
}

const fallbackData: JiraData = {
    issues: [],
    total: 0,
    status: "disconnected",
    message: "Configure Jira"
};

/**
 * Jira widget for dashboard (compact version)
 */
export default function JiraWidget() {
    const jiraData = useScript<JiraData>(SCRIPTS.JIRA, POLL_INTERVALS.SLOW, fallbackData);

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "to do":
                return "󰄰";
            case "in progress":
                return "󰑮";
            case "in review":
                return "󰁨";
            default:
                return "󰄬";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "highest":
            case "high":
                return "jira-priority-high";
            case "medium":
                return "jira-priority-medium";
            case "low":
            case "lowest":
                return "jira-priority-low";
            default:
                return "jira-priority-medium";
        }
    };

    return (
        <With value={jiraData}>
            {data => (
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={2}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.FILL}
                    class="jira-widget-compact"
                >
                    {/* Compact Header */}
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={6}
                        halign={Gtk.Align.FILL}
                        class="jira-header-compact"
                    >
                        <label
                            label="󰌃"
                            class="jira-icon-compact"
                        />
                        <label
                            label="JIRA"
                            class="jira-title-compact"
                            hexpand={true}
                            halign={Gtk.Align.START}
                        />
                        <label
                            label={`${data?.total}`}
                            class="jira-count-compact"
                        />
                    </box>

                    {/* Issues list or status message */}
                    {data?.status === "success" && data?.issues.length > 0 ? (
                        <scrolledwindow
                            vexpand={true}
                            hscrollbar-policy={Gtk.PolicyType.NEVER}
                            vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
                            class="jira-scroll-compact"
                        >
                            <box
                                orientation={Gtk.Orientation.VERTICAL}
                                spacing={1}
                                class="jira-issues-compact"
                            >
                                {data.issues.slice(0, 3).map(issue => (
                                    <box
                                        orientation={Gtk.Orientation.HORIZONTAL}
                                        spacing={4}
                                        halign={Gtk.Align.FILL}
                                        class={`jira-issue-compact ${getPriorityColor(issue.priority)}`}
                                    >
                                        <label
                                            label={getStatusIcon(issue.status)}
                                            class="jira-status-icon-compact"
                                        />
                                        <box
                                            orientation={Gtk.Orientation.VERTICAL}
                                            spacing={0}
                                            hexpand={true}
                                            halign={Gtk.Align.START}
                                        >
                                            <label
                                                label={issue.key}
                                                class="jira-key-compact"
                                                halign={Gtk.Align.START}
                                            />
                                            <label
                                                label={issue.summary.length > 25 ?
                                                    issue.summary.substring(0, 25) + "..." :
                                                    issue.summary}
                                                class="jira-summary-compact"
                                                halign={Gtk.Align.START}
                                                wrap={false}
                                                ellipsize={3}
                                            />
                                        </box>
                                    </box>
                                ))}
                            </box>
                        </scrolledwindow>
                    ) : (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={4}
                            halign={Gtk.Align.CENTER}
                            valign={Gtk.Align.CENTER}
                            vexpand={true}
                            class="jira-status-compact"
                        >
                            <label
                                label={data?.status === "error" ? ICONS.ERROR :
                                    data?.status === "success" ? "󰄬" : "󰗠"}
                                class="jira-status-icon-compact"
                            />
                            <label
                                label={data?.message}
                                class="jira-status-message-compact"
                                halign={Gtk.Align.CENTER}
                            />
                        </box>
                    )}
                </box>
            )}
        </With>
    );
}
