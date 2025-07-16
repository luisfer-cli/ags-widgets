import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Clock from "./dashboard/Clock"
import WpmCounter from "./dashboard/WpmCounter"
import ChessTracking from "./dashboard/ChessTracking"
import Programming from "./dashboard/Programming"

export default function Dashboard(monitor = 0) {
    return (
        <window
            name="dashboard"
            monitor={monitor}
            visible={true}
            class="dashboard"
            width-request={400}
            height-request={220}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand={true}
                vexpand={true}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                spacing={40}
            >
                {Clock()}
                {WpmCounter()}
                {ChessTracking()}
                {Programming()}
            </box>
        </window>
    )
}

