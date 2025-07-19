import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export default function ChessTracking() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/checkDay.sh`;

    const dayChecked = createPoll("check-day", 3000, async () => {
        try {
            await execAsync(scriptPath);
            return "true"
        } catch (e) {
            return "false";
        }
    })

    return (
        <box class="chesstrack">
            <label label={dayChecked} />
        </box>
    )
}

