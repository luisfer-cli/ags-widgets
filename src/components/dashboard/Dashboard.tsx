/**
 * Dashboard con diseño tipo grid 3x2 para monitores medianos
 * 
 * Layout:
 * ┌────────┬────────────┬─────────┐
 * │  Clock │ Taskwar.   │ Timew.  │
 * ├────────┼────────────┼─────────┤
 * │   Monitoring       │   WPM   │
 * └────────────────────┴─────────┘
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { WINDOW_DIMENSIONS } from "../../config/constants";
import Clock from "./Clock";
import WpmCounter from "./WpmCounter";
import Monitoring from "./Monitoring";
import Taskwarrior from "./Weather";
import Timewarrior from "./Timewarrior";

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
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.FILL}
                class="dashboard-main dashboard-grid"
            >
                {/* FILA SUPERIOR - 3 columnas */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={8}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.START}
                    class="dashboard-row dashboard-row-top"
                >
                    {/* Columna 1: Reloj */}
                    <box 
                        class="dashboard-cell dashboard-card clock-card" 
                        hexpand={false}
                        width-request={160}
                        height-request={100}
                    >
                        <Clock />
                    </box>

                    {/* Columna 2: Taskwarrior */}
                    <box 
                        class="dashboard-cell dashboard-card taskwarrior-card" 
                        hexpand={true}
                        height-request={100}
                    >
                        <Taskwarrior />
                    </box>

                    {/* Columna 3: Timewarrior */}
                    <box 
                        class="dashboard-cell dashboard-card timewarrior-card" 
                        hexpand={true}
                        height-request={100}
                    >
                        <Timewarrior />
                    </box>
                </box>

                {/* FILA INFERIOR - 2 columnas (MÁS PEQUEÑA) */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={8}
                    halign={Gtk.Align.FILL}
                    vexpand={true}
                    class="dashboard-row dashboard-row-bottom"
                >
                    {/* Columna 1-2: Monitoreo (span 2, más compacto) */}
                    <box 
                        class="dashboard-cell dashboard-card monitoring-card" 
                        hexpand={true} 
                        vexpand={true}
                        width-request={380}
                        height-request={180}
                    >
                        <Monitoring />
                    </box>

                    {/* Columna 3: WPM (más pequeño) */}
                    <box 
                        class="dashboard-cell dashboard-card wmp-card" 
                        hexpand={false} 
                        vexpand={true}
                        width-request={220}
                        height-request={180}
                    >
                        <WpmCounter />
                    </box>
                </box>
            </box>
        </window>
    );
}
