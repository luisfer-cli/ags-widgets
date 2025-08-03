/**
 * Widget de monitoreo del sistema ultra compacto con barras de progreso
 * Muestra CPU, RAM, GPU, disco y temperatura sin título
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { MonitoringData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS } from "../../config/constants";

/**
 * Barra de progreso compacta
 */
function CompactProgressBar({ value, label, icon, color = "primary" }: {
    value: number;
    label: string;
    icon: string;
    color?: string;
}) {
    const percentage = Math.min(value, 100);
    
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={6}
            class="progress-container-compact"
            halign={Gtk.Align.FILL}
        >
            <label label={icon} class="progress-icon-small" />
            <label label={label} class="progress-label-small" />
            <box
                class={`progress-bar-narrow progress-${color}`}
                hexpand={true}
                width-request={200}
            >
                <box
                    class="progress-fill-narrow"
                    width-request={Math.max(4, percentage * 2)}
                    height-request={3}
                />
            </box>
            <label
                label={`${value.toFixed(0)}%`}
                class="progress-value-small"
            />
        </box>
    );
}

/**
 * Widget de monitoreo compacto sin título
 * @returns JSX box element
 */
export default function Monitoring() {
    const monitoringData = useScript<MonitoringData>(
        SCRIPTS.MONITORING,
        POLL_INTERVALS.NORMAL,
        { cpu: 0, memory: 0 }
    );

    return (
        <With value={monitoringData}>
            {(data) => (
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={4}
                    halign={Gtk.Align.FILL}
                    class="monitoring-widget-compact"
                >
                    {/* CPU */}
                    <CompactProgressBar
                        value={data?.cpu || 0}
                        label="CPU"
                        icon={ICONS.CPU}
                        color="cpu"
                    />

                    {/* RAM */}
                    <CompactProgressBar
                        value={data?.memory || 0}
                        label="RAM"
                        icon={ICONS.MEMORY}
                        color="memory"
                    />

                    {/* GPU (solo si se detecta) */}
                    {data?.gpu && data.gpu.detected && (
                        <CompactProgressBar
                            value={data.gpu.usage}
                            label="GPU"
                            icon={ICONS.GPU}
                            color="gpu"
                        />
                    )}

                    {/* Disco */}
                    {data?.disk && (
                        <CompactProgressBar
                            value={data.disk.usage}
                            label="SSD"
                            icon={ICONS.DISK}
                            color="disk"
                        />
                    )}

                    {/* Temperatura del sistema */}
                    {data?.temperature && data.temperature > 0 && (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={6}
                            class="temp-container-compact"
                            halign={Gtk.Align.FILL}
                        >
                            <label label={ICONS.TEMPERATURE} class="progress-icon-small" />
                            <label label="TEMP" class="progress-label-small" />
                            <box hexpand={true} />
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