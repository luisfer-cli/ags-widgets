/**
 * WPM (Words Per Minute) counter widget
 * Displays typing speed from external monitoring
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { WpmData } from "../../types";
import { useScript } from "../../utils/hooks";

/**
 * WPM counter widget showing current typing speed
 * Reads data from get_wpm.sh script
 * @returns JSX box element with WPM display
 */
export default function WpmCounter() {
    // Poll for WPM data every 2 seconds for reasonable updates
    const wpmData = useScript<WpmData>(
        "get_wpm.sh",
        2000,
        { wpm: 0, accuracy: 0, status: "idle" }
    );

    // Keyboard icon for the widget
    const icon = "";

    return (
        <With value={wpmData}>
            {(data) => (
                <box
                    class="wpm"
                    orientation={Gtk.Orientation.VERTICAL}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    width_request={60}
                >
                    <label label={icon} />
                    <label 
                        label={data ? data.wpm?.toString() || "0" : "Err"} 
                    />
                </box>
            )}
        </With>
    );
}