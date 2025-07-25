/**
 * Main top bar component for AGS Desktop Shell
 * 
 * Features:
 * - Workspace indicators (1-10, with 10 displayed as 0)
 * - Current active application display
 * - Real-time updates via polling
 */
import { Astal, Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { With } from "ags";
import { BarStatus, ComponentProps } from "../../types";
import { safeJsonParse } from "../../utils";

/**
 * Creates workspace indicator labels
 * @param ids - Array of workspace IDs to display
 * @param current - Currently active workspace ID
 * @returns JSX elements for workspace indicators
 */
function createWorkspaceLabels(ids: number[], current: number) {
    return ids.map(id => {
        // Display workspace 10 as "0" for better UX
        const visibleLabel = id === 10 ? "0" : id.toString();
        
        return (
            <label
                label={visibleLabel}
                class={`workspace${id === current ? " current" : ""}`}
            />
        );
    });
}

/**
 * Top bar component showing workspaces and current app
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Bar({ monitor = 0 }: ComponentProps = {}) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    // Poll for workspace and application status every 100ms
    const barStatus = createPoll<BarStatus>(
        { workspace: 1, app: "Loading..." },
        100,
        async (): Promise<BarStatus> => {
            try {
                // Fetch workspace and window data in parallel
                const [wsRaw, appRaw] = await Promise.all([
                    execAsync("hyprctl activeworkspace -j").catch(() => "{}"),
                    execAsync("hyprctl activewindow -j").catch(() => "{}")
                ]);

                const wsJson = safeJsonParse(wsRaw);
                const appJson = safeJsonParse(appRaw);

                return {
                    workspace: wsJson.id ?? 1,
                    app: appJson.class ?? "Luisfer"
                };
            } catch (error) {
                console.error("Error fetching bar status:", error);
                return { workspace: 1, app: "Error" };
            }
        }
    );

    return (
        <window
            visible
            name="bar"
            class="bar"
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
        >
            <With value={barStatus}>
                {({ workspace, app }) => (
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.CENTER}
                        hexpand
                        visible
                    >
                        {/* Left workspace indicators (1-5) */}
                        <box
                            hexpand
                            class="workspace-bar"
                            halign={Gtk.Align.CENTER}
                            spacing={30}
                        >
                            {createWorkspaceLabels([1, 2, 3, 4, 5], workspace)}
                        </box>

                        {/* Center: Current application display */}
                        <box
                            halign={Gtk.Align.CENTER}
                            hexpand
                            class="current-app"
                        >
                            <label label={app} class="bar-title-text" />
                        </box>

                        {/* Right workspace indicators (6-10) */}
                        <box
                            halign={Gtk.Align.CENTER}
                            class="workspace-bar"
                            spacing={30}
                            hexpand
                        >
                            {createWorkspaceLabels([6, 7, 8, 9, 10], workspace)}
                        </box>
                    </box>
                )}
            </With>
        </window>
    );
}