/**
 * Dashboard con diseño de 2 columnas principales para alineación perfecta
 * 
 * Layout:
 * ┌────────┬────────────┬─────────┐
 * │  Clock │ Taskwar.   │ Timew.  │
 * ├────────┴────────────┼─────────┤
 * │   Monitoring        │   WPM   │
 * │                     ├─────────┤
 * │                     │ Flowmd. │
 * └─────────────────────┴─────────┘
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { WINDOW_DIMENSIONS } from "../../config/constants";
import Clock from "./Clock";
import WpmCounter from "./WpmCounter";
import Flowmodoro from "./Flowmodoro";
import Monitoring from "./Monitoring";
import Taskwarrior from "./Weather";
import Timewarrior from "./Timewarrior";
import JiraWidget from "./JiraWidget";

/**
 * Dashboard con layout tipo grid 3x2 simulado
 * @param monitor - Número de monitor (default: 0)
 * @returns JSX window element
 */
export default function Dashboard({ monitor = 0 }: ComponentProps = {}) {
    return (
        <window
            name="dashboard"
            monitor={monitor}
            visible={true}
            class="dashboard-window"
            width-request={WINDOW_DIMENSIONS.DASHBOARD.width}
            height-request={WINDOW_DIMENSIONS.DASHBOARD.height}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={8}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.FILL}
                class="dashboard-main dashboard-grid"
            >
                {/* COLUMNA IZQUIERDA: Clock + Taskwarrior arriba, Monitoring abajo */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={8}
                    hexpand={false}
                    vexpand={true}
                    width-request={380} class="dashboard-left-column"
                >
                    {/* Fila superior: Clock + Taskwarrior */}
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={8}
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.START}
                        height-request={80}
                        class="dashboard-row dashboard-row-top"
                    >
                        {/* Clock */}
                        <box
                            class="dashboard-cell dashboard-card clock-card"
                            hexpand={false}
                            width-request={160}
                            height-request={80}
                        >
                            <Clock />
                        </box>

                        {/* Taskwarrior */}
                        <box
                            class="dashboard-cell dashboard-card taskwarrior-card"
                            hexpand={false}
                            width-request={240} height-request={80}
                        >
                            <Taskwarrior />
                        </box>
                    </box>

                    {/* Fila inferior: Monitoring */}
                    <box
                        class="dashboard-cell dashboard-card monitoring-card"
                        hexpand={false}
                        vexpand={false}
                        width-request={380} height-request={120}
                    >
                        <Monitoring />
                    </box>

                    {/* Jira Widget */}
                    <box
                        class="dashboard-cell dashboard-card jira-card"
                        hexpand={false}
                        vexpand={true}
                        width-request={380}
                        height-request={72}
                    >
                        <JiraWidget />
                    </box>
                </box>

                {/* COLUMNA DERECHA: Timewarrior, WPM, Flowmodoro */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={8}
                    hexpand={false}
                    vexpand={true}
                    width-request={230}
                    class="dashboard-right-column"
                >
                    {/* Timewarrior */}
                    <box
                        class="dashboard-cell dashboard-card timewarrior-card"
                        hexpand={false}
                        vexpand={false}
                        height-request={90}
                        width-request={230}
                        valign={Gtk.Align.START}
                    >
                        <Timewarrior />
                    </box>

                    {/* WPM */}
                    <box
                        class="dashboard-cell dashboard-card wmp-card"
                        hexpand={false}
                        vexpand={true}
                        height-request={64}
                        width-request={230}
                    >
                        <WpmCounter />
                    </box>

                    {/* Flowmodoro */}
                    <box
                        class="dashboard-cell dashboard-card flowmodoro-card"
                        hexpand={false}
                        vexpand={true}
                        height-request={64}
                        width-request={230}
                    >
                        <Flowmodoro />
                    </box>
                </box>
            </box>
        </window>
    );
}
