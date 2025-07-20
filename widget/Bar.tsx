import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

export default function Bar(monitor = 0) {
    const time = createPoll("", 1000, "date")
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <window
            visible
            name="bar"
            class="Bar"
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={app}
        >
            <centerbox cssName="centerbox">
                <button
                    $type="start"
                    onClicked={() => execAsync("echo hello").then(console.log)}
                    hexpand
                    halign={Gtk.Align.CENTER}
                >
                    <label label="Welcome to AGS!" />
                </button>
                <box $type="center" />
                <menubutton $type="end" hexpand halign={Gtk.Align.CENTER}>
                    <label label={time} />
                    <popover>
                        <Gtk.Calendar />
                    </popover>
                </menubutton>
            </centerbox>
        </window>
    )
}
