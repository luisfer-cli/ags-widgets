import { Astal, Gtk, Gdk } from "ags/gtk4"
import Clock from "./dashboard/Clock"
import WpmCounter from "./dashboard/WpmCounter"
import ChessTracking from "./dashboard/ChessTracking"
import Programming from "./dashboard/Programming"
import Monitoring from "./dashboard/Monitoring"
import Media from "./dashboard/Media"

export default function Dashboard(monitor = 0) {
    return (
        <window
            name="dashboard"
            monitor={monitor}
            visible={true}
            class="dashboard"
            width-request={480}
            height-request={280}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={30}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                hexpand={true}
                vexpand={true}
            >
                {/* Columna izquierda: compacta */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={16}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.START}
                >
                    {Clock()}
                    {WpmCounter()}
                </box>

                {/* Centro con más peso visual */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={20}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                >
                    {ChessTracking()}
                    {Monitoring()}
                </box>

                {/* Columna derecha con bloques más pequeños */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={16}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.END}
                >
                    {Programming()}
                    {Media()}
                </box>
            </box>
        </window>
    )
}

