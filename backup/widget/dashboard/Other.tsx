import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

// Esto actualiza cada 5 segundos el estado del título actual
type Song = { title: string };

export default function Other() {

    const currentSong = createPoll<Song | null>({ title: "" }, 500, () => {
        return execAsync(["playerctl", "status"])
            .then(status => {
                if (!status.includes("Playing"))
                    return null;

                return execAsync(["playerctl", "metadata", "title"])
                    .then(title => ({ title: title.trim() }));
            })
            .catch(() => null);
    });
    return (
        <box class="media-widget" orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <label label="🎵 Reproduciendo ahora:" />

            <With value={currentSong}>
                {(song) => song && <label label={song.title} />}
            </With>
        </box>
    );
}

