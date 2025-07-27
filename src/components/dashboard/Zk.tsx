/**
 * Zettelkasten (Zk) widget for daily note tracking
 * Shows whether today's daily note has been created/checked
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

/**
 * Zettelkasten daily check widget
 * Displays status of today's daily note
 * @returns JSX box element
 */
export default function Zk() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/checkDay.sh`;

    // Poll for daily note status every 3 seconds
    const dayChecked = createPoll("false", 3000, async (): Promise<string> => {
        try {
            // Script execution success means day is checked
            await execAsync([scriptPath]);
            return "true";
        } catch (error) {
            // Script returns exit code 1 when file doesn't exist - this is normal
            return "false";
        }
    });

    return (
        <With value={dayChecked}>
            {(isChecked) => (
                <box
                    hexpand
                    halign={Gtk.Align.FILL}
                    vexpand
                    valign={Gtk.Align.FILL}
                    orientation={Gtk.Orientation.HORIZONTAL}
                    class={`widget ${isChecked}`}
                >
                    {/* Zettelkasten icon - note/document symbol */}
                    <label 
                        hexpand 
                        halign={Gtk.Align.CENTER} 
                        label="󰂺" 
                    />
                </box>
            )}
        </With>
    );
}