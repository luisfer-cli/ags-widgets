import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

export default function Bar(monitor = 0) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

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
                <box
                    hexpand
                    class="bar-title"
                    halign={Gtk.Align.CENTER}
                    spacing={30}
                >
                    <label label="1" class="bar-title-text" />
                    <label label="2" class="bar-title-text" />
                    <label label="3" class="bar-title-text" />
                    <label label="4" class="bar-title-text" />
                    <label label="5" class="bar-title-text" />
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
                    <label label="6" class="bar-title-text" />
                    <label label="7" class="bar-title-text" />
                    <label label="8" class="bar-title-text" />
                    <label label="9" class="bar-title-text" />
                    <label label="0" class="bar-title-text" />
                </box>
            </box>
        </window >
    )
}
