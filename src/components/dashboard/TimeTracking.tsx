/**
 * Time tracking widget placeholder
 * This component can be extended for time tracking functionality
 */
import { Gtk } from "ags/gtk4";

/**
 * Time tracking widget (placeholder implementation)
 * @returns JSX box element
 */
export default function TimeTracking() {
    return (
        <box 
            class="time-tracking-widget" 
            orientation={Gtk.Orientation.VERTICAL} 
            spacing={6}
        >
            <label label="⏱️ Time Tracking" />
            <label label="Not configured" class="placeholder-text" />
        </box>
    );
}