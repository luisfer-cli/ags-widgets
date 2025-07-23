import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal, Gdk } from "ags/gtk4";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

type VolumeInfo = {
    volume: string;
    icon: string;
    value: number;
};

type OsdState = {
    visible: boolean;
    volumeInfo: VolumeInfo;
    monitor: number;
};

export default function Osd() {
    const [osdState, setOsdState] = createState<OsdState>({
        visible: false,
        volumeInfo: { volume: "0%", icon: "󰝟", value: 0 },
        monitor: 0
    });

    let hideTimeoutId: number | null = null;
    let lastVolInt: number = 0;  // <-- guardamos el último valor de volumen

    function getVolumeIcon(volInt: number): string {
        if (volInt === 0) return "󰝟";   // mute
        if (volInt <= 40) return "󰕿";  // low
        if (volInt <= 60) return "󰖀";  // medium
        return "󰕾";                   // high
    }

    async function getVolumeAndShow() {
        try {
            const output = await execAsync(["pactl", "get-sink-volume", "@DEFAULT_SINK@"]);
            const match = output.match(/(\d+)%/);
            const volume = match ? match[1] : "0";
            const volInt = parseInt(volume);

            // Si no cambió el volumen, no hacemos nada
            if (volInt === lastVolInt) {
                return;
            }
            lastVolInt = volInt;

            const icon = getVolumeIcon(volInt);

            const output2 = await execAsync(["hyprctl", "monitors", "-j"]);
            const monitors = JSON.parse(output2);
            let monitor = monitors.findIndex((m: any) => m.focused);


            setOsdState({
                visible: true,
                volumeInfo: { volume: `${volume}%`, icon, value: volInt },
                monitor: monitor
            });

            // Reiniciamos el timeout de ocultar
            if (hideTimeoutId !== null) {
                GLib.Source.remove(hideTimeoutId);
            }
            hideTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
                setOsdState((prev) => ({ ...prev, visible: false }));
                hideTimeoutId = null;
                return GLib.SOURCE_REMOVE;
            });
        } catch (err) {
            print(`Error obteniendo volumen: ${err}`);
        }
    }

    // Subproceso de pactl subscribe
    const proc = new Gio.Subprocess({
        argv: ["pactl", "subscribe"],
        flags: Gio.SubprocessFlags.STDOUT_PIPE,
    });
    proc.init(null);

    const stdoutStream = proc.get_stdout_pipe();
    if (!stdoutStream) {
        throw new Error("No se pudo obtener el pipe de salida de pactl");
    }

    const reader = new Gio.DataInputStream({ base_stream: stdoutStream });

    function listen() {
        reader.read_line_async(GLib.PRIORITY_DEFAULT, null, (_: any, res: any) => {
            try {
                const [line] = reader.read_line_finish(res);
                if (!line) {
                    listen();
                    return;
                }
                const event = new TextDecoder().decode(line);

                // Cualquier cambio en sink puede disparar el check,
                // pero solo mostraremos si el volumen cambió de verdad:
                if (event.includes("on sink")) {
                    getVolumeAndShow();
                }

                listen();
            } catch (err) {
                print(`Error leyendo línea de subscribe: ${err}`);
            }
        });
    }

    listen();

    return (
        <window
            name="osd"
            monitor={osdState(s => s.monitor)}
            visible={osdState(s => s.visible)}
            layer={Astal.Layer.OVERLAY}
            exclusivity={0}
            anchor={Astal.WindowAnchor.TOP}
            margin_top={30}
            class="osd-window"
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
                <label
                    class="osd-icon"
                    label={osdState(s => s.volumeInfo.icon)}
                />
                <levelbar
                    class="osd-bar"
                    orientation={Gtk.Orientation.HORIZONTAL}
                    value={osdState(s => s.volumeInfo.value)}
                    mode={Gtk.LevelBarMode.DISCRETE}
                    min-value={0}
                    max-value={100}
                />
                <label
                    class="osd-label"
                    label={osdState(s => s.volumeInfo.volume)}
                />
            </box>
        </window>
    );
}

