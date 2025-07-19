import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=4.0";
import Pango from "gi://Pango?version=1.0";

export default function Media() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/media.sh`;

    const data = createPoll("media", 1000, async () => {
        try {
            const output = await execAsync(scriptPath);
            const json = JSON.parse(output);
            return `${json.player}:${json.artist}:${json.title}`;
        } catch {
            return "::";
        }
    });

    const getPart = (val: string, index: number) => {
        const parts = val.split(":");
        return parts.length > index ? parts[index] : "";
    };

    const getIcon = (player: string) => {
        switch (player.toLowerCase()) {
            case "spotify": return " ";
            case "mpv": return "󰎁 ";
            case "vlc": return "󰕼 ";
            case "firefox": return "󰈹 ";
            default: return "󰝚 ";
        }
    };

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6} class="media" valign={Gtk.Align.CENTER}>

            <label
                label={data.as(val => getIcon(getPart(val, 0)))}
                class="media-icon"
                xalign={0}
            />
            <label
                label={data.as(val => {
                    const artist = getPart(val, 1);
                    const title = getPart(val, 2);
                    return artist || title ? `${artist} - ${title}` : "";
                })}
                class="media-info"
                ellipsize={Pango.EllipsizeMode.END}
                wrap={true}
            />
        </box>
    );
}

