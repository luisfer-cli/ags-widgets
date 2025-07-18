import { Astal, Gtk, Gdk } from "ags/gtk4"
import Clock from "./dashboard/Clock"
import WpmCounter from "./dashboard/WpmCounter"
import ChessTracking from "./dashboard/ChessTracking"
import Programming from "./dashboard/Programming"
import Monitoring from "./dashboard/Monitoring"

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
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={20}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                >
                    {Clock()}
                    {WpmCounter()}
                </box>
                {ChessTracking()}
                {Monitoring()}
                {Programming()}
            </box>
        </window>
    )
}

