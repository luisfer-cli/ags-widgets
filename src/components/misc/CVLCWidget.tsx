/**
 * Floating CVLC Control Widget
 * Provides controls for VLC command line player
 */
import { Astal, Gtk } from "ags/gtk4";
import { With } from "ags";
import { useScript, executeScript } from "../../utils";
import { POLL_INTERVALS, CSS_CLASSES } from "../../config/constants";
import { ComponentProps } from "../../types";

interface CVLCStatus {
    status: string;
    pid: string;
    playing: boolean;
}

interface CVLCResponse {
    action?: string;
    success: boolean;
    error?: string;
    file?: string;
}

export default function CVLCWidget({ monitor = 0 }: ComponentProps = {}) {
    const cvlcStatus = useScript<CVLCStatus>(
        "cvlc-control.sh", 
        POLL_INTERVALS.NORMAL, 
        { status: "stopped", pid: "", playing: false },
        ["status"]
    );

    const handlePlay = async () => {
        const result = await Astal.Process.exec_async([
            "zenity",
            "--file-selection",
            "--title=Seleccionar archivo multimedia",
            "--file-filter=Audio/Video | *.mp3 *.mp4 *.avi *.mkv *.wav *.flac *.ogg *.webm *.m4a"
        ]);
        
        if (result.trim()) {
            await executeScript("cvlc-control.sh", "play", result.trim());
        }
    };

    const handleStop = async () => {
        await executeScript("cvlc-control.sh", "stop");
    };

    const handleToggle = async () => {
        await executeScript("cvlc-control.sh", "toggle");
    };

    return (
        <window
            name={`cvlc-widget-${monitor}`}
            monitor={monitor}
            layer={Astal.Layer.OVERLAY}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            margin_top={60}
            margin_right={20}
            keymode={Astal.Keymode.ON_DEMAND}
            visible={true}
            class_name="cvlc-widget-window"
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                class_name={`cvlc-widget ${CSS_CLASSES.CARD}`}
            >
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={8}
                    class_name="cvlc-header"
                >
                    <label
                        label="󰕼"
                        class_name="cvlc-icon"
                    />
                    <label
                        label="CVLC Player"
                        class_name="cvlc-title"
                    />
                    <With value={cvlcStatus}>
                        {(status) => (
                            <label
                                label={status.playing ? "▶" : "⏹"}
                                class_name={`cvlc-status ${status.playing ? CSS_CLASSES.PRIMARY : CSS_CLASSES.MUTED}`}
                            />
                        )}
                    </With>
                </box>

                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={4}
                    class_name="cvlc-controls"
                >
                    <button
                        class_name={`cvlc-button ${CSS_CLASSES.BUTTON}`}
                        onClicked={handlePlay}
                        tooltip_text="Seleccionar y reproducir archivo"
                    >
                        <label label="📁" />
                    </button>

                    <With value={cvlcStatus}>
                        {(status) => (
                            <button
                                class_name={`cvlc-button ${CSS_CLASSES.BUTTON}`}
                                onClicked={handleToggle}
                                sensitive={status.playing}
                                tooltip_text={status.playing ? "Detener reproducción" : "No hay reproducción activa"}
                            >
                                <label label={status.playing ? "⏸" : "▶"} />
                            </button>
                        )}
                    </With>

                    <button
                        class_name={`cvlc-button ${CSS_CLASSES.BUTTON}`}
                        onClicked={handleStop}
                        tooltip_text="Detener y cerrar CVLC"
                    >
                        <label label="⏹" />
                    </button>
                </box>

                <With value={cvlcStatus}>
                    {(status) => (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={4}
                            class_name="cvlc-info"
                            visible={status.playing}
                        >
                            <label
                                label={`PID: ${status.pid}`}
                                class_name={`cvlc-pid ${CSS_CLASSES.MUTED}`}
                                xalign={0}
                            />
                            <label
                                label="🔊"
                                class_name="cvlc-volume-icon"
                            />
                        </box>
                    )}
                </With>
            </box>
        </window>
    );
}