/**
 * Contador WPM optimizado y centrado para pantalla de 7"
 */
import { Gtk } from "ags/gtk4";
import { WpmData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS } from "../../config/constants";

/**
 * Componente WPM completamente centrado y optimizado
 * @returns JSX box element
 */
export default function WpmCounter() {
    const wpmData = useScript<WpmData>(
        SCRIPTS.WPM_COUNTER,
        POLL_INTERVALS.NORMAL,
        { wpm: 0, accuracy: 0, status: "idle" }
    );

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={0}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            class="wpm-widget-centered"
        >
            {/* Contenedor interno para centrado perfecto */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={2}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                hexpand={true}
                vexpand={true}
                class="wpm-inner-container"
            >
                <label
                    label={wpmData.as((data) => `${data?.wpm || 0}`)}
                    class="wpm-value-centered"
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                />
                <label 
                    label="WPM" 
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    class="wpm-label-centered"
                />
            </box>
        </box>
    );
}