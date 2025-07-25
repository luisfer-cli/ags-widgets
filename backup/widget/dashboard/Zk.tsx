import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export default function ChessTracking() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/checkDay.sh`;

    const dayChecked = createPoll("check-day", 3000, async () => {
        try {
            await execAsync(scriptPath);
            return "true";
        } catch (e) {
            return "false";
        }
    });

    return (
        <With value={dayChecked}>
            {(value) => (
                <box
                    hexpand
                    halign={Gtk.Align.FILL}  // Aquí permitimos que se expanda y ocupe ancho completo
                    vexpand                   // Opcional: que también crezca verticalmente
                    valign={Gtk.Align.FILL}   // Opcional para llenar verticalmente
                    orientation={Gtk.Orientation.HORIZONTAL}
                    class={`widget ${value}`}
                >
                    <label hexpand halign={Gtk.Align.CENTER} label={"󰂺"} />
                </box>
            )}
        </With>
    );
}

