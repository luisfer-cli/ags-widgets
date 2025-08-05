/**
 * Widget Flowmodoro independiente para productividad
 * Muestra estado actual del flowmodoro con diferentes estilos por estado
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { FlowmodoroData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS } from "../../config/constants";

/**
 * Componente Flowmodoro independiente
 * @returns JSX box element
 */
export default function Flowmodoro() {
    const flowmodoroData = useScript<FlowmodoroData>(
        SCRIPTS.FLOWMODORO,
        POLL_INTERVALS.FAST,
        { mode: "none", status: "No session" }
    );

    return (
        <With value={flowmodoroData}>
            {(data) => (
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={8}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.CENTER}
                    hexpand={true}
                    vexpand={true}
                    class={`flowmodoro-widget flowmodoro-${data?.mode || "none"}`}
                >
                    {/* Icono y Estado Principal */}
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={8}
                        halign={Gtk.Align.CENTER}
                        class="flowmodoro-header"
                    >
                        <label
                            label={ICONS.FLOWMODORO}
                            class="flowmodoro-icon-main"
                        />
                        <label
                            label={data?.mode?.toUpperCase() || "READY"}
                            class={`flowmodoro-status-label ${data?.mode || "none"}`}
                        />
                    </box>

                    {/* Tiempo */}
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={4}
                        halign={Gtk.Align.CENTER}
                        class="flowmodoro-time-container"
                    >
                        {data?.mode === "work" && (
                            <>
                                <label
                                    label={data.worked_hms || "00:00:00"}
                                    class="flowmodoro-time-display work"
                                    halign={Gtk.Align.CENTER}
                                />
                                <label
                                    label="Time Working"
                                    class="flowmodoro-time-label"
                                    halign={Gtk.Align.CENTER}
                                />
                            </>
                        )}

                        {data?.mode === "break" && (
                            <>
                                <label
                                    label={data.remaining_hms || "00:00:00"}
                                    class="flowmodoro-time-display break"
                                    halign={Gtk.Align.CENTER}
                                />
                                <label
                                    label="Break Remaining"
                                    class="flowmodoro-time-label"
                                    halign={Gtk.Align.CENTER}
                                />
                            </>
                        )}

                        {data?.mode === "none" && (
                            <label
                                label="Sin sesión de trabajo iniciada"
                                class="flowmodoro-ready-message"
                                halign={Gtk.Align.CENTER}
                            />
                        )}

                        {data?.mode === "error" && (
                            <label
                                label={data.message || "Error"}
                                class="flowmodoro-error-message"
                                halign={Gtk.Align.CENTER}
                            />
                        )}
                    </box>
                </box>
            )}
        </With>
    );
}
