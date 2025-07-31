/**
 * Main top bar component for AGS Desktop Shell
 * 
 * Features:
 * - Workspace indicators (1-10, with 10 displayed as 0)
 * - Current active application display
 * - Real-time updates via polling
 */
import { Astal, Gtk } from "ags/gtk4";
import { With } from "ags";
import { BarStatus, ComponentProps, HyprlandWorkspace, HyprlandWindow } from "../../types";
import { useJsonScript } from "../../utils/hooks";

/**
 * Top bar component showing workspaces and current app
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Bar({ monitor = 0 }: ComponentProps = {}) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    // Poll for workspace status every 500ms
    const workspaceStatus = useJsonScript<HyprlandWorkspace>(
        "hyprctl-workspace.sh",
        500,
        { id: 1 } as HyprlandWorkspace
    );

    // Poll for active window status every 500ms  
    const windowStatus = useJsonScript<HyprlandWindow>(
        "hyprctl-window.sh",
        500,
        { class: "Luisfer" } as HyprlandWindow
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
                    <label
                        label="1"
                        class={`workspace${workspaceStatus?.id === 1 ? " current" : ""}`}
                    />
                    <label
                        label="2"
                        class={`workspace${workspaceStatus?.id === 2 ? " current" : ""}`}
                    />
                    <label
                        label="3"
                        class={`workspace${workspaceStatus?.id === 3 ? " current" : ""}`}
                    />
                    <label
                        label="4"
                        class={`workspace${workspaceStatus?.id === 4 ? " current" : ""}`}
                    />
                    <label
                        label="5"
                        class={`workspace${workspaceStatus?.id === 5 ? " current" : ""}`}
                    />
                </box>

                {/* Center: Current application display */}
                <box
                    halign={Gtk.Align.CENTER}
                    hexpand
                    class="current-app"
                >
                    <label
                        label={windowStatus(ws => ws.class || "LuisFer")}
                        class="bar-title-text"
                    />
                </box>

                {/* Right workspace indicators (6-10) */}
                <box
                    halign={Gtk.Align.CENTER}
                    class="workspace-bar"
                    spacing={30}
                    hexpand
                >
                    <label
                        label="6"
                        class={`workspace${workspaceStatus?.id === 6 ? " current" : ""}`}
                    />
                    <label
                        label="7"
                        class={`workspace${workspaceStatus?.id === 7 ? " current" : ""}`}
                    />
                    <label
                        label="8"
                        class={`workspace${workspaceStatus?.id === 8 ? " current" : ""}`}
                    />
                    <label
                        label="9"
                        class={`workspace${workspaceStatus?.id === 9 ? " current" : ""}`}
                    />
                    <label
                        label="0"
                        class={`workspace${workspaceStatus?.id === 10 ? " current" : ""}`}
                    />
                </box>
            </box>
        </window>
    );
}
