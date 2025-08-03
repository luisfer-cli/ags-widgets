/**
 * On-Screen Display (OSD) component for volume feedback only
 * Shows temporary overlay notifications for volume changes, mute/unmute
 * Excludes media player changes
 */
import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal } from "ags/gtk4";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import { ComponentProps } from "../../types";
import { safeJsonParse, clamp, getFocusedMonitor } from "../../utils";

// Volume information interface
interface VolumeInfo {
    volume: string;
    icon: string;
    value: number;
    isMuted: boolean;
}

// OSD state interface
interface OsdState {
    visible: boolean;
    volumeInfo: VolumeInfo;
    monitor: number;
}

/**
 * Get appropriate volume icon based on volume level and mute status
 */
function getVolumeIcon(volumeLevel: number, isMuted: boolean): string {
    if (isMuted || volumeLevel === 0) return "󰝟";   // mute
    if (volumeLevel <= 40) return "󰕿";  // low
    if (volumeLevel <= 60) return "󰖀";  // medium
    return "󰕾";                        // high
}

/**
 * On-Screen Display component for volume feedback only
 * @returns JSX window element for OSD overlay
 */
export default function Osd({}: ComponentProps = {}) {
    // OSD state management
    const [osdState, setOsdState] = createState<OsdState>({
        visible: false,
        volumeInfo: { volume: "0%", icon: "󰝟", value: 0, isMuted: false },
        monitor: 0
    });

    let hideTimeoutId: number | null = null;
    let lastVolumeLevel: number = 0;
    let lastMuteState: boolean = false;

    /**
     * Get current volume and mute status, display OSD if changed
     */
    async function updateVolumeDisplay(): Promise<void> {
        try {
            // Get current volume from PulseAudio
            const volumeOutput = await execAsync(["pactl", "get-sink-volume", "@DEFAULT_SINK@"]);
            const volumeMatch = volumeOutput.match(/(\d+)%/);
            const volumeString = volumeMatch ? volumeMatch[1] : "0";
            const volumeLevel = parseInt(volumeString);

            // Get mute status
            const muteOutput = await execAsync(["pactl", "get-sink-mute", "@DEFAULT_SINK@"]);
            const isMuted = muteOutput.includes("yes");

            // Skip update if both volume and mute state haven't changed
            if (volumeLevel === lastVolumeLevel && isMuted === lastMuteState) {
                return;
            }
            
            lastVolumeLevel = volumeLevel;
            lastMuteState = isMuted;

            // Get appropriate icon for volume level and mute state
            const icon = getVolumeIcon(volumeLevel, isMuted);

            // Get focused monitor for display
            const focusedMonitor = await getFocusedMonitor();

            // Update OSD state
            setOsdState({
                visible: true,
                volumeInfo: { 
                    volume: `${volumeString}%`, 
                    icon, 
                    value: clamp(volumeLevel, 0, 100),
                    isMuted
                },
                monitor: focusedMonitor
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
     * Listen for PulseAudio events - only volume related
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

                // Only trigger on sink volume/mute events, filter out source events and media changes
                if (event.includes("on sink") && (event.includes("change") || event.includes("volume") || event.includes("mute"))) {
                    // Avoid triggering on media player events by checking the event type more specifically
                    if (!event.includes("source-output") && !event.includes("sink-input")) {
                        updateVolumeDisplay();
                    }
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
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10} class="osd-content">
                {/* Volume icon */}
                <label
                    class="osd-icon"
                    label={osdState(s => s.volumeInfo.icon)}
                    valign={Gtk.Align.CENTER}
                />
                
                {/* Custom volume level bar */}
                <box orientation={Gtk.Orientation.VERTICAL} class="osd-bar-container" valign={Gtk.Align.CENTER}>
                    <box orientation={Gtk.Orientation.HORIZONTAL} class="osd-bar-background">
                        <box 
                            class="osd-bar-fill"
                            css={osdState(s => `min-width: ${Math.max(3, s.volumeInfo.value * 1.2)}px;`)}
                        />
                    </box>
                </box>
                
                {/* Volume percentage */}
                <label
                    class="osd-label"
                    label={osdState(s => s.volumeInfo.volume)}
                    valign={Gtk.Align.CENTER}
                />
            </box>
        </window>
    );
}