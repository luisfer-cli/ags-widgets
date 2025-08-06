/**
 * Widget de timewarrior con diseño horizontal optimizado
 * Muestra tiempo actual, estado del tracking y tareas recientes
 */
import { Gtk } from "ags/gtk4";
import { TimewarriorData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS } from "../../config/constants";

/**
 * Convierte segundos a formato HH:MM
 */
function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Componente de timewarrior con layout horizontal: tiempo+estado | información de tracking
 * @returns JSX box element
 */
export default function Timewarrior() {
    const timeData = useScript<TimewarriorData>(
        SCRIPTS.TIMEWARRIOR,
        POLL_INTERVALS.NORMAL,
        {
            currentTask: null,
            todayTime: 0,
            weekTime: 0,
            recentTasks: [],
            isTracking: false
        }
    );

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={0}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            class="timewarrior-widget-horizontal"
        >
            {/* Lado izquierdo: Tiempo hoy + Estado */}
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={8}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                class="timewarrior-left-panel"
            >
                <label
                    label={timeData.as((data) => formatTime(data?.todayTime || 0))}
                    class="timewarrior-time-display"
                    halign={Gtk.Align.CENTER}
                />
                <label
                    label={timeData.as((data) => {
                        if (data?.isTracking) return "⏱";
                        const todayHours = Math.floor((data?.todayTime || 0) / 3600);

                        if (todayHours === 0) return "⏸"; // Sin tiempo registrado
                        if (todayHours >= 8) return "✓"; // Día completo
                        if (todayHours >= 4) return "⚡"; // Medio día
                        return "⏳"; // Poco tiempo
                    })}
                    class="timewarrior-status-symbol"
                    halign={Gtk.Align.CENTER}
                />
            </box>

            {/* Lado derecho: Información de tracking */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                class="timewarrior-right-panel"
            >
                {/* Tarea actual o última tarea */}
                <label
                    label={timeData.as((data) => {
                        if (data?.currentTask) {
                            const maxChars = 28;
                            const desc = data.currentTask.description;
                            return desc.length > maxChars ?
                                "▶ " + desc.substring(0, maxChars) + "..." :
                                "▶ " + desc;
                        }

                        const lastTask = data?.recentTasks[0];
                        if (lastTask && lastTask.tags.length > 0) {
                            const desc = lastTask.tags[0];
                            const maxChars = 28;
                            return desc.length > maxChars ?
                                "◦ " + desc.substring(0, maxChars) + "..." :
                                "◦ " + desc;
                        }

                        return "◦ Sin seguimiento";
                    })}
                    class="timewarrior-current-task"
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    wrap={false}
                />

                {/* Tiempo de la semana */}
                <label
                    label={timeData.as((data) => {
                        const weekHours = Math.floor((data?.weekTime || 0) / 3600);
                        const weekMins = Math.floor(((data?.weekTime || 0) % 3600) / 60);
                        return `Semana: ${weekHours}h ${weekMins}m`;
                    })}
                    class="timewarrior-week-time"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    wrap={false}
                />

                {/* Última tarea completada o segunda tarea reciente */}
                <label
                    label={timeData.as((data) => {
                        const secondTask = data?.recentTasks[1];
                        if (secondTask && secondTask.tags.length > 0) {
                            const maxChars = 20;
                            const desc = secondTask.tags[0];
                            return desc.length > maxChars ?
                                "• " + desc.substring(0, maxChars) + "..." :
                                "• " + desc;
                        }
                        return "";
                    })}
                    class="timewarrior-recent-task"
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                />
            </box>
        </box>
    );
}
