import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import { With } from "ags"

export default function Bar(monitor = 0) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    type BarStatus = {
        workspace: number
        app: string
    }

    const barStatus = createPoll<BarStatus>(
        { workspace: 1, app: "Loading..." },
        100,
        async () => {
            const [wsRaw, appRaw] = await Promise.all([
                execAsync("hyprctl activeworkspace -j").catch(() => "{}"),
                execAsync("hyprctl activewindow -j").catch(() => "{}"),
            ]);

            const wsJson = JSON.parse(wsRaw);
            const appJson = JSON.parse(appRaw);

            return {
                workspace: wsJson.id ?? 1,
                app: appJson.class ?? "Unknown",
            };
        }
    );

    const workspaceLabels = (ids: number[], current: number) =>
        ids.map(id => {
            const visibleLabel = id === 10 ? "0" : id.toString();
            return (
                <label
                    label={visibleLabel}
                    class={`workspace${id === current ? " current" : ""}`}
                />
            );
        });

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
                        <box
                            hexpand
                            class="workspace-bar"
                            halign={Gtk.Align.CENTER}
                            spacing={30}
                        >
                            {workspaceLabels([1, 2, 3, 4, 5], workspace)}
                        </box>

                        <box
                            halign={Gtk.Align.CENTER}
                            hexpand
                            class="current-app"
                        >
                            <label label={app} class="bar-title-text" />
                        </box>

                        <box
                            halign={Gtk.Align.CENTER}
                            class="workspace-bar"
                            spacing={30}
                            hexpand
                        >
                            {workspaceLabels([6, 7, 8, 9, 10], workspace)}
                        </box>
                    </box>
                )}
            </With>
        </window>
    );
}

