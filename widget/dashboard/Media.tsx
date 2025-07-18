import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export default function Media() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/media.sh`;
    let player = ""
    let artist = ""
    let title = ""

    const current = createPoll("media", 500, async () => {
        try {
            const output = await execAsync(scriptPath);
            const json = JSON.parse(output);
            player = json.player;
            artist = json.artist;
            title = json.title;
            return `${player}`;
        } catch (e) {
            return "❌ Error ejecutando script";
        }
    })

    return (
        <box class="widget programming">
            <label label={current} />
        </box>
    )
}

