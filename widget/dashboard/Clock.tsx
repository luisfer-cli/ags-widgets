import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createPoll } from "ags/time";

export default function Clock() {
    const time = createPoll("", 1000, () => {
        return new Date().toLocaleTimeString();
    });

    return <label class="clock" label={time} />;
}

