/**
 * System monitoring widget displaying resource usage
 * Shows RAM usage and CPU percentage
 */
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";
import { executeScript } from "../../utils";

// System monitoring data interface
interface MonitoringData {
    ram_used_gb: number;
    cpu_usage_percent: number;
}

/**
 * System resource monitoring widget
 * Displays current RAM and CPU usage
 * @returns JSX box element
 */
export default function Monitoring() {
    // Poll for system data every 2 seconds
    const monitoringData = createPoll("monitoring", 2000, async () => {
        const data = await executeScript("monitor.sh");

        if (!data) {
            return "0:0"; // Fallback format
        }

        const ramGb = data.ram_used_gb ?? 0;
        const cpuPercent = data.cpu_usage_percent ?? 0;

        return `${ramGb}:${cpuPercent}`;
    });

    /**
     * Extract RAM usage from data string
     */
    const getRamUsage = (dataString: string): number => {
        const parts = dataString.split(':');
        return parts.length > 1 ? parseFloat(parts[0]) : 0;
    };

    /**
     * Extract CPU usage from data string
     */
    const getCpuUsage = (dataString: string): number => {
        const parts = dataString.split(':');
        return parts.length > 1 ? parseFloat(parts[1]) : 0;
    };

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={12}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        >
            {/* RAM Usage Display */}
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={8}
                valign={Gtk.Align.CENTER}
            >
                <label
                    label="󰧑"
                    xalign={0}
                    class="monitor-label"
                />
                <label
                    label={monitoringData.as(val => `${getRamUsage(val).toFixed(1)} GB`)}
                    class="monitor-value"
                />
            </box>

            {/* CPU Usage Display */}
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={8}
                valign={Gtk.Align.CENTER}
            >
                <label
                    label=""
                    xalign={0}
                    class="monitor-label"
                />
                <label
                    label={monitoringData.as(val => `${getCpuUsage(val).toFixed(1)}%`)}
                    class="monitor-value"
                />
            </box>
        </box>
    );
}
