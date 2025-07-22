import { Astal, Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { execAsync } from "ags/process";
import { With } from "ags";

export default function Botbar(monitor = 0) {
    const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

    // Poll para obtener artista y título usando playerctl
    const currentTrack = createPoll<string>(
        "",
        1000,
        async () => {
            try {
                const artist = (await execAsync("playerctl metadata artist")).trim() || "Desconocido";
                const title = (await execAsync("playerctl metadata title")).trim() || "Sin título";

                return `${artist} – ${title}`;
            } catch {
                return "";
            }
        }
    );

    return (
        <window
            class="botbar"
            name="botbar"
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={BOTTOM | LEFT | RIGHT}
            visible
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                class="botbar-box"
                spacing={8}
            >
                <With value={currentTrack}>
                    {(track) =>
                        track ? (
                            <box
                                orientation={Gtk.Orientation.HORIZONTAL}
                                spacing={6}
                                valign={Gtk.Align.CENTER}
                                halign={Gtk.Align.CENTER}
                            >
                                {/* Ícono NerdFont */}
                                <label
                                    label="󰝚" // Nerd Font:  => nf-md-music
                                    class="botbar-icon"
                                />
                                <label
                                    label={track}
                                    class="botbar-label"
                                    xalign={0.5}
                                    hexpand
                                />
                            </box>
                        ) : null
                    }
                </With>
            </box>
        </window>
    );
}

