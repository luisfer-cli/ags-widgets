import { createState } from "ags";
import { Gtk, Astal } from "ags/gtk4";
import { ComponentProps, AudioDevice } from "../../types";
import { getFocusedMonitor, executeScript } from "../../utils";

function getVolumeIcon(volume: number, muted: boolean): string {
    if (muted || volume === 0) return "󰝟";
    if (volume <= 40) return "󰕿";
    if (volume <= 60) return "󰖀";
    return "󰕾";
}

function getMicIcon(muted: boolean): string {
    return muted ? "󰍭" : "󰍬";
}

export default function AudioConfig({ monitor = 0 }: ComponentProps = {}) {
    let win: Astal.Window;

    const [currentMonitor, setCurrentMonitor] = createState(monitor);
    const [visible, setVisible] = createState(false);

    const [loading, setLoading] = createState(true);
    const [speakers, setSpeakers] = createState<AudioDevice[]>([]);
    const [microphones, setMicrophones] = createState<AudioDevice[]>([]);

    function parseDevices(output: string, type: 'sink' | 'source'): AudioDevice[] {
        const devices: AudioDevice[] = [];
        const deviceBlocks = output.split(new RegExp(`^${type === 'sink' ? 'Sink' : 'Source'} #`, 'm'));

        for (let i = 1; i < deviceBlocks.length; i++) {
            const block = deviceBlocks[i];
            const lines = block.split('\n');

            const indexMatch = lines[0].match(/^(\d+)/);
            if (!indexMatch) continue;

            const device: Partial<AudioDevice> = { index: parseInt(indexMatch[1]) };

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('Description:')) {
                    device.name = trimmed.substring('Description:'.length).trim();
                } else if (trimmed.startsWith('Volume:')) {
                    const volumeMatch = trimmed.match(/(\d+)%/);
                    if (volumeMatch) {
                        device.volume = parseInt(volumeMatch[1]);
                    }
                } else if (trimmed.startsWith('Mute:')) {
                    device.muted = trimmed.toLowerCase().includes('yes');
                } else if (trimmed.includes('device.description') && !device.name) {
                    const match = trimmed.match(/device\.description\s*=\s*"([^"]+)"/);
                    if (match) {
                        device.name = match[1];
                    }
                }
            }

            if (device.index !== undefined && device.name) {
                devices.push({
                    index: device.index,
                    name: device.name,
                    description: device.name,
                    volume: device.volume || 0,
                    muted: device.muted || false,
                });
            }
        }

        return devices;
    }

    async function loadAudioDevices(): Promise<void> {
        setLoading(true);
        try {
            const [sinksOutput, sourcesOutput] = await Promise.all([
                executeScript("audio-control.sh", "list-sinks"),
                executeScript("audio-control.sh", "list-sources")
            ]);

            const parsedSpeakers = parseDevices(sinksOutput?.text || "", 'sink');
            const parsedMicrophones = parseDevices(sourcesOutput?.text || "", 'source')
                .filter(src => !src.name.toLowerCase().includes('monitor'));

            setSpeakers(parsedSpeakers);
            setMicrophones(parsedMicrophones);
        } catch (error) {
            console.error("Error loading audio devices:", error);
        } finally {
            setLoading(false);
        }
    }

    async function setVolume(type: 'sink' | 'source', index: number, volume: number): Promise<void> {
        try {
            await executeScript("audio-control.sh", "set-volume", type, index.toString(), `${volume}%`);
            await loadAudioDevices();
        } catch (error) {
            console.error(`Error setting ${type} volume:`, error);
        }
    }

    async function toggleMute(type: 'sink' | 'source', index: number): Promise<void> {
        try {
            await executeScript("audio-control.sh", "toggle-mute", type, index.toString());
            await loadAudioDevices();
        } catch (error) {
            console.error(`Error toggling ${type} mute:`, error);
        }
    }

    async function showAudioConfig(): Promise<void> {
        const isCurrentlyVisible = visible.get();
        if (!isCurrentlyVisible) {
            const focusedMonitor = await getFocusedMonitor();
            setCurrentMonitor(focusedMonitor);
            win.monitor = focusedMonitor;
            loadAudioDevices();
        }
        setVisible(!isCurrentlyVisible);
    }

    function hideAudioConfig(): void {
        setVisible(false);
    }

    function renderDeviceControl(device: AudioDevice, type: 'sink' | 'source') {
        const icon = type === 'sink'
            ? getVolumeIcon(device.volume, device.muted)
            : getMicIcon(device.muted);

        return (
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                class="audio-device"
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                    <button class="audio-mute-btn" onClicked={() => toggleMute(type, device.index)}>
                        <label label={icon} />
                    </button>
                    <label
                        label={device.name}
                        class="audio-device-name"
                        hexpand={true}
                        halign={Gtk.Align.START}
                    />
                </box>

                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                    <button onClicked={() => setVolume(type, device.index, Math.max(0, device.volume - 5))}>
                        <label label="󰝞" />
                    </button>

                    <slider
                        class="audio-volume-scale"
                        orientation={Gtk.Orientation.HORIZONTAL}
                        hexpand={true}
                        min={0}
                        max={100}
                        step={1}
                        value={device.volume}
                        onValueChanged={(scale: any) => {
                            const value = Math.round(scale.get_value());
                            setVolume(type, device.index, value);
                        }}
                    />

                    <button onClicked={() => setVolume(type, device.index, Math.min(100, device.volume + 5))}>
                        <label label="󰝝" />
                    </button>

                    <label label={`${device.volume}%`} class="audio-volume-label" />
                </box>
            </box>
        );
    }

    (globalThis as any).toggleAudioConfig = showAudioConfig;

    return (
        <window
            $={(ref) => (win = ref)}
            name="audio-config"
            monitor={currentMonitor.get()}
            visible={visible}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            margin_top={50}
            margin_right={20}
            class="audio-config-window"
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={16} class="audio-config-container">
                {/* Header */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                    <label label="🔊 Configuración de Audio" class="audio-config-title" hexpand={true} halign={Gtk.Align.START} />
                    <button class="audio-close-btn" onClicked={hideAudioConfig}>
                        <label label="✕" />
                    </button>
                </box>

                <Gtk.Separator />

                {/* Loading */}
                {loading((v) => v) && (
                    <label label="Cargando dispositivos..." class="audio-loading" />
                )}

                {/* Content */}
                {!loading((v) => v) && (
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
                        {/* Parlantes */}
                        {speakers((s) => s.length > 0) && (
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                                <label label="🔊 Parlantes" class="audio-section-title" halign={Gtk.Align.START} />
                                {speakers.get().map(speaker => renderDeviceControl(speaker, 'sink'))}
                            </box>
                        )}

                        {/* Separador */}
                        {speakers.get().length > 0 && microphones.get().length > 0 && <Gtk.Separator />}

                        {/* Micrófonos */}
                        {microphones((m) => m.length > 0) && (
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                                <label label="🎤 Micrófonos" class="audio-section-title" halign={Gtk.Align.START} />
                                {microphones.get().map(mic => renderDeviceControl(mic, 'source'))}
                            </box>
                        )}

                        {/* Nada encontrado */}
                        {speakers.get().length === 0 && microphones.get().length === 0 && (
                            <label label="No se encontraron dispositivos de audio" class="audio-no-devices" />
                        )}
                    </box>
                )}
            </box>
        </window>
    );
}

