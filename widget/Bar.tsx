import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import { With } from "ags"

export default function Bar(monitor = 0) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    const currentWorkspace = createPoll<number>(
        1,
        300,
        async () => {
            return execAsync("hyprctl activeworkspace -j")
                .then(output => JSON.parse(output).id ?? 1)
                .catch(() => 1);
        }
    );

    const workspaceLabels = (ids: number[], current: number) =>
        ids.map(id => (
            <label
                label={id.toString()}
                class={`bar-title-text${id === current ? " current" : ""}`}
            />
        ));

    return (
        <window
            visible
            name="bar"
            class="Bar"
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
                class="bar">
                <With value={currentWorkspace}>
                    {current => (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            halign={Gtk.Align.FILL}
                            valign={Gtk.Align.CENTER}
                            hexpand
                            visible
                            class="bar"
                        >
                            <box
                                hexpand
                                class="bar-title"
                                halign={Gtk.Align.CENTER}
                                spacing={30}
                            >
                                {workspaceLabels([1, 2, 3, 4, 5], current)}
                            </box>
                            <box
                                halign={Gtk.Align.CENTER}
                                hexpand
                                class="bar-title"
                            >
                                <label label="Astal" class="bar-title-text" />
                            </box>
                            <box
                                halign={Gtk.Align.CENTER}
                                spacing={30}
                                hexpand
                                class="bar-title"
                            >
                                {workspaceLabels([6, 7, 8, 9, 0], current)}
                            </box>
                        </box>
                    )}
                </With>
            </box>
        </window >
    )
}

