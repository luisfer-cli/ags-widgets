/**
 * Widget de tareas pendientes con diseño horizontal optimizado
 */
import { Gtk } from "ags/gtk4";
import { TaskwarriorData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS } from "../../config/constants";

/**
 * Componente de tareas con layout horizontal: número+símbolo | lista de tareas
 * @returns JSX box element
 */
export default function Taskwarrior() {
    const taskData = useScript<TaskwarriorData>(
        SCRIPTS.TASKWARRIOR,
        POLL_INTERVALS.SLOW,
        { pending: [], completed: [], pendingCount: 0, completedToday: 0 }
    );

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={0}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            class="taskwarrior-widget-horizontal"
        >
            {/* Lado izquierdo: Número fusionado con estado por color */}
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={0}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                class="taskwarrior-left-panel"
            >
                <label
                    label={taskData.as((data) => `${data?.pendingCount || 0}`)}
                    class={taskData.as((data) => {
                        const pending = data?.pendingCount || 0;
                        const completed = data?.completedToday || 0;

                        if (pending === 0) return "taskwarrior-number-success"; // Sin pendientes - verde
                        if (completed > pending) return "taskwarrior-number-productive"; // Más completadas que pendientes - azul
                        if (pending > 5) return "taskwarrior-number-warning"; // Muchas pendientes - naranja/rojo
                        return "taskwarrior-number-normal"; // Situación normal - blanco
                    })}
                    halign={Gtk.Align.CENTER}
                />
            </box>

            {/* Lado derecho: Lista de tareas */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={1}
                halign={Gtk.Align.END}
                hexpand={true}
                class="taskwarrior-right-panel"
            >
                {/* Tareas pendientes */}
                <label
                    label={taskData.as((data) => {
                        const firstPending = data?.pending[0];
                        if (!firstPending) return "";
                        const maxChars = 30;
                        return firstPending.description.length > maxChars ?
                            "• " + firstPending.description.substring(0, maxChars) + "..." :
                            "• " + firstPending.description;
                    })}
                    class="taskwarrior-task-item pending"
                    halign={Gtk.Align.START}
                    wrap={false}
                />
                <label
                    label={taskData.as((data) => {
                        const secondPending = data?.pending[1];
                        if (!secondPending) return "";
                        const maxChars = 30;
                        return secondPending.description.length > maxChars ?
                            "• " + secondPending.description.substring(0, maxChars) + "..." :
                            "• " + secondPending.description;
                    })}
                    class="taskwarrior-task-item pending"
                    halign={Gtk.Align.START}
                    wrap={false}
                />

                {/* Tareas completadas hoy */}
                <label
                    label={taskData.as((data) => {
                        const firstCompleted = data?.completed[0];
                        if (!firstCompleted) return "";
                        const maxChars = 18;
                        return firstCompleted.description.length > maxChars ?
                            "✓ " + firstCompleted.description.substring(0, maxChars) + "..." :
                            "✓ " + firstCompleted.description;
                    })}
                    class="taskwarrior-task-item completed"
                    halign={Gtk.Align.START}
                    wrap={false}
                />
            </box>
        </box>
    );
}
