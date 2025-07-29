/**
 * System monitoring widget displaying resource usage
 * Shows RAM usage and CPU percentage
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { MonitoringData } from "../../types";
import { useScript } from "../../utils/hooks";

/**
 * System resource monitoring widget
 * Displays current RAM and CPU usage
 * @returns JSX box element
 */
export default function Monitoring() {
    // Poll for system data every 2 seconds
    const monitoringData = useScript<MonitoringData>(
        "monitor.sh",
        2000,
        { cpu: 0, memory: 0, temperature: 0 }
    );

    return (
        <With value={monitoringData}>
            {(data) => (
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
                            label={data 
                                ? `${(data.memory || data.ram_used_gb || 0).toFixed(1)} GB`
                                : "0.0 GB"
                            }
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
                            label=""
                            xalign={0}
                            class="monitor-label"
                        />
                        <label
                            label={data 
                                ? `${(data.cpu || data.cpu_usage_percent || 0).toFixed(1)}%`
                                : "0.0%"
                            }
                            class="monitor-value"
                        />
                    </box>

                    {/* Temperature Display (if available) */}
                    {data?.temperature && (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={8}
                            valign={Gtk.Align.CENTER}
                        >
                            <label
                                label="🌡"
                                xalign={0}
                                class="monitor-label"
                            />
                            <label
                                label={`${data.temperature.toFixed(1)}°C`}
                                class="monitor-value"
                            />
                        </box>
                    )}
                </box>
            )}
        </With>
    );
}