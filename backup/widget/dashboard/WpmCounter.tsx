import { createPoll } from "ags/time";
import { exec } from "ags/process";
import { Gtk } from "ags/gtk4";

export default function WpmCounter() {
    const wpm = createPoll("wpm", 100, () => {
        try {
            let val = exec("cat /tmp/current_wpm.txt").trim();
            return val
        } catch (err) {
            return "Err";
        }
    });
    const icon = "";

    return (
        <box class="wpm"
            orientation={Gtk.Orientation.VERTICAL}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            width_request={60}
        >
            <label label={icon} />
            <label label={wpm} />
        </box>
    )
}

