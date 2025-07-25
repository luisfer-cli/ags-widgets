/**
 * On-Screen Display (OSD) component for volume and system feedback
 * Shows temporary overlay notifications for volume changes
 */
import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal } from "ags/gtk4";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import { ComponentProps } from "../../types";
import { safeJsonParse, clamp } from "../../utils";

// Volume information interface
interface VolumeInfo {
    volume: string;
    icon: string;
    value: number;
}

// OSD state interface
interface OsdState {
    visible: boolean;
    volumeInfo: VolumeInfo;
    monitor: number;
}

/**
 * Get appropriate volume icon based on volume level
 */
function getVolumeIcon(volumeLevel: number): string {
    if (volumeLevel === 0) return "󰝟";   // mute
    if (volumeLevel <= 40) return "󰕿";  // low
    if (volumeLevel <= 60) return "󰖀";  // medium
    return "󰕾";                        // high
}

/**
 * On-Screen Display component for volume feedback
 * @returns JSX window element for OSD overlay
 */
export default function Osd({}: ComponentProps = {}) {
    // OSD state management
    const [osdState, setOsdState] = createState<OsdState>({
        visible: false,
        volumeInfo: { volume: "0%", icon: "󰝟", value: 0 },
        monitor: 0
    });

    let hideTimeoutId: number | null = null;
    let lastVolumeLevel: number = 0; // Track last volume to prevent unnecessary updates

    /**
     * Get current volume and display OSD if changed
     */
    async function updateVolumeDisplay(): Promise<void> {
        try {
            // Get current volume from PulseAudio
            const volumeOutput = await execAsync(["pactl", "get-sink-volume", "@DEFAULT_SINK@"]);
            const volumeMatch = volumeOutput.match(/(\d+)%/);
            const volumeString = volumeMatch ? volumeMatch[1] : "0";
            const volumeLevel = parseInt(volumeString);

            // Skip update if volume hasn't changed
            if (volumeLevel === lastVolumeLevel) {
                return;
            }
            lastVolumeLevel = volumeLevel;

            // Get appropriate icon for volume level
            const icon = getVolumeIcon(volumeLevel);

            // Get focused monitor for display
            const monitorsOutput = await execAsync(["hyprctl", "monitors", "-j"]);
            const monitors = safeJsonParse(monitorsOutput, []);
            const focusedMonitor = monitors.findIndex((m: any) => m.focused);

            // Update OSD state
            setOsdState({
                visible: true,
                volumeInfo: { 
                    volume: `${volumeString}%`, 
                    icon, 
                    value: clamp(volumeLevel, 0, 100) 
                },
                monitor: Math.max(0, focusedMonitor)
            });

            // Reset hide timer
            if (hideTimeoutId !== null) {
                GLib.Source.remove(hideTimeoutId);
            }
            
            // Auto-hide after 1.5 seconds
            hideTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
                setOsdState((prev) => ({ ...prev, visible: false }));
                hideTimeoutId = null;
                return GLib.SOURCE_REMOVE;
            });
            
        } catch (error) {
            console.error("Error getting volume:", error);
        }
    }

    // Set up PulseAudio event subscription
    const pulseProcess = new Gio.Subprocess({
        argv: ["pactl", "subscribe"],
        flags: Gio.SubprocessFlags.STDOUT_PIPE,
    });
    pulseProcess.init(null);

    const stdoutStream = pulseProcess.get_stdout_pipe();
    if (!stdoutStream) {
        throw new Error("Could not get stdout pipe from pactl");
    }

    const reader = new Gio.DataInputStream({ base_stream: stdoutStream });

    /**
     * Listen for PulseAudio events
     */
    function listenForVolumeEvents(): void {
        reader.read_line_async(GLib.PRIORITY_DEFAULT, null, (_: any, res: any) => {
            try {
                const [line] = reader.read_line_finish(res);
                if (!line) {
                    listenForVolumeEvents();
                    return;
                }
                
                const event = new TextDecoder().decode(line);

                // Trigger volume check on sink events
                if (event.includes("on sink")) {
                    updateVolumeDisplay();
                }

                // Continue listening
                listenForVolumeEvents();
            } catch (error) {
                console.error("Error reading subscribe line:", error);
            }
        });
    }

    // Start listening for events
    listenForVolumeEvents();

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
                {/* Volume icon */}
                <label
                    class="osd-icon"
                    label={osdState(s => s.volumeInfo.icon)}
                />
                
                {/* Volume level bar */}
                <levelbar
                    class="osd-bar"
                    orientation={Gtk.Orientation.HORIZONTAL}
                    value={osdState(s => s.volumeInfo.value)}
                    mode={Gtk.LevelBarMode.DISCRETE}
                    min-value={0}
                    max-value={100}
                />
                
                {/* Volume percentage */}
                <label
                    class="osd-label"
                    label={osdState(s => s.volumeInfo.volume)}
                />
            </box>
        </window>
    );
}