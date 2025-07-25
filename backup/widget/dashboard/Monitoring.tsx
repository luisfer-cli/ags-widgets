import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=4.0";

export default function Monitoring() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/monitor.sh`;

    const data = createPoll("monitoring", 2000, async () => {
        const output = await execAsync(scriptPath);
        const json = JSON.parse(output);
        return `${json.ram_used_gb}:${json.cpu_usage_percent}`;
    });

    const getRam = (val: string) => {
        const parts = val.split(':');
        return parts.length > 1 ? parseFloat(parts[0]) : 0;
    };

    const getCpu = (val: string) => {
        const parts = val.split(':');
        return parts.length > 1 ? parseFloat(parts[1]) : 0;
    };

    return (

        <box orientation={Gtk.Orientation.VERTICAL} spacing={12} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} valign={Gtk.Align.CENTER}>
                <label label="󰧑" xalign={0} class="monitor-label" />
                <label label={data.as(val => `${getRam(val).toFixed(1)} GB`)} class="monitor-value" />
            </box>

            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} valign={Gtk.Align.CENTER}>
                <label label="" xalign={0} class="monitor-label" />
                <label label={data.as(val => `${getCpu(val).toFixed(1)} %`)} class="monitor-value" />
            </box>
        </box>
    );
}

