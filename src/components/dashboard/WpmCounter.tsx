/**
 * WPM (Words Per Minute) counter widget
 * Displays typing speed from external monitoring
 */
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";
import { executeScript } from "../../utils";

/**
 * WPM counter widget showing current typing speed
 * Reads data from get_wpm.sh script
 * @returns JSX box element with WPM display
 */
export default function WpmCounter() {
    // Poll for WPM data every 100ms for responsive updates
    const wpm = createPoll("0", 100, async () => {
        try {
            const data = await executeScript("get_wpm.sh");
            return data?.wpm || "0";
        } catch (error) {
            console.error("Error reading WPM data:", error);
            return "Err";
        }
    });

    // Keyboard icon for the widget
    const icon = "";

    return (
        <box
            class="wpm"
            orientation={Gtk.Orientation.VERTICAL}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            width_request={60}
        >
            <label label={icon} />
            <label label={wpm} />
        </box>
    );
}
