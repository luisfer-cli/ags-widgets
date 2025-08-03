/**
 * Contador WPM ultra minimalista para pantalla de 7" - versión destacada sin título
 */
import { Gtk } from "ags/gtk4";
import { WpmData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS } from "../../config/constants";

/**
 * Componente WPM ultra minimalista y destacado
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
            spacing={2}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            class="wpm-widget-featured"
        >
            <label
                label={wpmData.as((data) => `${data?.wpm || 0}`)}
                class="wpm-value-featured"
                halign={Gtk.Align.CENTER}
            />
            <label 
                label="WPM" 
                halign={Gtk.Align.CENTER}
                class="wpm-label-featured"
            />
        </box>
    );
}