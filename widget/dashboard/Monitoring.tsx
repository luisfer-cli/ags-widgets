import { exec, execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export default function Monitoring() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/monitor.sh`;
    const data = createPoll("monitoring", 2000, async () => {
        try {
            const output = await execAsync(scriptPath);
            const json = JSON.parse(output);
            return `${json.ram_used_gb} : ${json.cpu_usage_percent}`
        }
        catch (e) {
            return "❌ Error executing script";
        }
    })

    return (
        <box class="widget monitor">
            <label label={data} />
        </box>
    )
}
