/**
 * Dashboard ultra minimalista con diseño tipo grid para monitores pequeños
 * 
 * Layout:
 * - Grid 2x2 optimizado: Reloj, Clima, Monitoreo, WPM
 * - Solo información esencial, sin títulos
 * - Efectos modernos y transparencias
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { WINDOW_DIMENSIONS } from "../../config/constants";
import Clock from "./Clock";
import WpmCounter from "./WpmCounter";
import Monitoring from "./Monitoring";
import Weather from "./Weather";

/**
 * Dashboard ultra minimalista con layout tipo grid
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
                spacing={4} 
                halign={Gtk.Align.FILL} 
                valign={Gtk.Align.FILL}
                class="dashboard-main"
            >
                {/* Fila Superior */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={4}
                    halign={Gtk.Align.FILL}
                    class="dashboard-grid-row"
                >
                    {/* Reloj */}
                    <box class="dashboard-card clock-card" hexpand={true}>
                        <Clock />
                    </box>

                    {/* Clima */}
                    <box class="dashboard-card weather-card" hexpand={true}>
                        <Weather />
                    </box>
                </box>

                {/* Fila Inferior */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={4}
                    halign={Gtk.Align.FILL}
                    vexpand={true}
                    class="dashboard-grid-row"
                >
                    {/* Monitoreo */}
                    <box class="dashboard-card monitoring-card" hexpand={true} vexpand={true}>
                        <Monitoring />
                    </box>

                    {/* Solo WPM */}
                    <box class="dashboard-card wpm-card" hexpand={true} vexpand={true}>
                        <WpmCounter />
                    </box>
                </box>
            </box>
        </window>
    );
}