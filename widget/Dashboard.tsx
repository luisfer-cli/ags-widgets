import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Clock from "./dashboard/Clock"



export default function Dashboard(monitor = 0) {
    return (
        <window
            name="dashboard"
            monitor={monitor}
            visible={true}
            class="dashboard"
            width-request={300}
            height-request={200}
        >
            <box
                class="centered-box"
                hexpand={true}
                vexpand={true}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                {Clock()}
            </box>
        </window>
    );
}

