import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS, CSS_CLASSES } from "../../config/constants";

interface KeyHistoryData {
    keys: string[];
}

/**
 * Widget que muestra el historial visual de las últimas teclas presionadas
 * @param monitor - Número de monitor (default: 0)
 * @returns JSX element
 */
export default function KeyHistoryWidget({ monitor = 0 }: ComponentProps = {}) {
    const fallbackData: KeyHistoryData = { keys: [] };
    
    const keyHistory = useScript<KeyHistoryData>(
        SCRIPTS.KEYLOGGER_TEST,
        POLL_INTERVALS.NORMAL, // Usar NORMAL en lugar de FAST para evitar errores
        fallbackData
    );

    return (
        <With value={keyHistory}>
            {(data) => (
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={4}
                    class={`${CSS_CLASSES.WIDGET} key-history-widget`}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.FILL}
                >
                    {/* Header */}
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={6}
                        halign={Gtk.Align.START}
                        class="key-history-header"
                    >
                        <label 
                            label={ICONS.KEYBOARD}
                            class="key-history-icon"
                        />
                        <label 
                            label="Key History"
                            class="key-history-title"
                        />
                    </box>

                    {/* Keys display */}
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={4}
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.CENTER}
                        class="key-history-container"
                    >
                        {data && data.keys && data.keys.length > 0 ? (
                            data.keys.slice(-10).map((key, index) => (
                                <box
                                    class={`key-history-key ${index === data.keys.length - 1 ? 'key-latest' : ''}`}
                                    halign={Gtk.Align.CENTER}
                                    valign={Gtk.Align.CENTER}
                                >
                                    <label 
                                        label={key}
                                        class="key-label"
                                    />
                                </box>
                            ))
                        ) : (
                            <label 
                                label="Press some keys..."
                                class="key-history-placeholder"
                            />
                        )}
                    </box>
                </box>
            )}
        </With>
    );
}