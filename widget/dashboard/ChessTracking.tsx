import { exec } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export default function ChessTracking() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/timewarriorchess.sh`;

    const chessStatus = createPoll("chess-tracking", 100, () => {
        try {
            const output = exec(scriptPath);
            const json = JSON.parse(output);
            return `${json.current} (${json.alt}) ${json.time}`;
        } catch (e) {
            return "❌ Error ejecutando script";
        }
    })

    return <label class="chess-tracking" label={chessStatus} />;
}

