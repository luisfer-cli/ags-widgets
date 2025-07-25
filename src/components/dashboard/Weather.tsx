/**
 * Weather widget placeholder
 * This component can be extended for weather information display
 */
import { Gtk } from "ags/gtk4";

/**
 * Weather information widget (placeholder implementation)
 * @returns JSX box element
 */
export default function Weather() {
    return (
        <box 
            class="weather-widget" 
            orientation={Gtk.Orientation.VERTICAL} 
            spacing={6}
        >
            <label label="🌤️ Weather" />
            <label label="Not configured" class="placeholder-text" />
        </box>
    );
}