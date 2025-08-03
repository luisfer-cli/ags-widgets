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
            spacing={8}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            class="taskwarrior-widget-horizontal"
        >
            {/* Lado izquierdo: Número grande + Símbolo */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={0}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                class="taskwarrior-left-panel"
            >
                <label
                    label={taskData.as((data) => `${data?.pendingCount || 0}`)}
                    class="taskwarrior-big-number"
                    halign={Gtk.Align.CENTER}
                />
                <label
                    label={taskData.as((data) => {
                        const pending = data?.pendingCount || 0;
                        const completed = data?.completedToday || 0;
                        
                        if (pending === 0) return "✓"; // Sin pendientes
                        if (completed > pending) return "+"; // Más completadas que pendientes
                        if (pending > 5) return "⚠"; // Muchas pendientes
                        return "±"; // Situación normal
                    })}
                    class="taskwarrior-status-symbol"
                    halign={Gtk.Align.CENTER}
                />
            </box>

            {/* Lado derecho: Lista de tareas */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={1}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.START}
                hexpand={true}
                class="taskwarrior-right-panel"
            >
                {/* Tareas pendientes */}
                <label
                    label={taskData.as((data) => {
                        const firstPending = data?.pending[0];
                        if (!firstPending) return "";
                        const maxChars = 18;
                        return firstPending.description.length > maxChars ? 
                            "• " + firstPending.description.substring(0, maxChars) + "..." : 
                            "• " + firstPending.description;
                    })}
                    class="taskwarrior-task-item pending"
                    halign={Gtk.Align.CENTER}
                    wrap={false}
                />
                <label
                    label={taskData.as((data) => {
                        const secondPending = data?.pending[1];
                        if (!secondPending) return "";
                        const maxChars = 18;
                        return secondPending.description.length > maxChars ? 
                            "• " + secondPending.description.substring(0, maxChars) + "..." : 
                            "• " + secondPending.description;
                    })}
                    class="taskwarrior-task-item pending"
                    halign={Gtk.Align.CENTER}
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
                    halign={Gtk.Align.CENTER}
                    wrap={false}
                />
            </box>
        </box>
    );
}