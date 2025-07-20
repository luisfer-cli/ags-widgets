import { Gtk } from "ags/gtk4"
import Clock from "./dashboard/Clock"
import WpmCounter from "./dashboard/WpmCounter"
import ChessTracking from "./dashboard/ChessTracking"
import Programming from "./dashboard/Programming"
import Monitoring from "./dashboard/Monitoring"
import Zk from "./dashboard/Zk"

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
            <box orientation={Gtk.Orientation.VERTICAL} spacing={20} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                {/* Fila 1 */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={20}>
                    <box class="widget clock">{Clock()}</box>
                    <box class="widget">{WpmCounter()}</box>
                    <box class="widget">{Zk()}</box>
                </box>

                {/* Fila 2 */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={20}>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                        <box>{ChessTracking()}</box>
                        <box class="widget">{Programming()}</box>
                    </box>
                    <box class="widget">{Monitoring()}</box>
                </box>
            </box>
        </window>
    )
}

