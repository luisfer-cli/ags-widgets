/**
 * Stats esenciales ultra minimalistas para pantalla de 7"
 */
import { Gtk } from "ags/gtk4";
import { MonitoringData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS } from "../../config/constants";

/**
 * Componente de estadísticas ultra minimalista
 * @returns JSX box element
 */
export default function QuickStats() {
    const monitoringData = useScript<MonitoringData>(
        SCRIPTS.MONITORING,
        POLL_INTERVALS.NORMAL,
        { cpu: 0, memory: 0 }
    );

    const formatBytes = (bytes: number) => {
        if (bytes >= 1024) {
            return `${(bytes / 1024).toFixed(0)}MB/s`;
        }
        return `${bytes.toFixed(0)}KB/s`;
    };

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            halign={Gtk.Align.FILL}
            class="stats-widget-minimal"
        >
            {/* Solo descarga de internet */}
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2} halign={Gtk.Align.CENTER}>
                <label 
                    label="Red" 
                    halign={Gtk.Align.CENTER}
                    class="stats-label-minimal"
                />
                <label
                    label={monitoringData.as((data) => 
                        data?.network ? formatBytes(data.network.download) : "0KB/s"
                    )}
                    class="stats-value-minimal"
                    halign={Gtk.Align.CENTER}
                />
            </box>

            {/* Solo nombre del proceso top */}
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2} halign={Gtk.Align.CENTER}>
                <label 
                    label="Top" 
                    halign={Gtk.Align.CENTER}
                    class="stats-label-minimal"
                />
                <label
                    label={monitoringData.as((data) => {
                        if (!data?.processes || data.processes.length === 0) return "---";
                        const name = data.processes[0].name;
                        return name.length > 10 ? name.substring(0, 10) + "..." : name;
                    })}
                    halign={Gtk.Align.CENTER}
                    class="stats-value-minimal"
                />
            </box>
        </box>
    );
}