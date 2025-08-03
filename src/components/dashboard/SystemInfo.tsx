/**
 * Widget de información del sistema mostrando uptime compacto
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { MonitoringData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS } from "../../config/constants";

/**
 * Componente de información del sistema compacto
 * @returns JSX box element
 */
export default function SystemInfo() {
    const monitoringData = useScript<MonitoringData>(
        SCRIPTS.MONITORING,
        POLL_INTERVALS.SLOW,
        { cpu: 0, memory: 0 }
    );

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <With value={monitoringData}>
            {(data) => (
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={6}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                >
                    <label
                        label="Sistema"
                        class="card-title-small"
                        halign={Gtk.Align.CENTER}
                    />
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                        <label
                            label="Activo"
                            class="system-info-label-small"
                            halign={Gtk.Align.CENTER}
                        />
                        <label
                            label={data?.uptime ? formatUptime(data.uptime) : "0m"}
                            class="system-info-value-small"
                            halign={Gtk.Align.CENTER}
                        />
                    </box>
                    {data?.temperature && data.temperature > 0 && (
                        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} halign={Gtk.Align.CENTER}>
                            <label label="🌡" class="temp-icon-small" />
                            <label
                                label={`${data.temperature.toFixed(0)}°C`}
                                class="temp-value-small"
                            />
                        </box>
                    )}
                </box>
            )}
        </With>
    );
}