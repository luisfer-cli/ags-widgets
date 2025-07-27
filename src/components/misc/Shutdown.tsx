/**
 * Shutdown popup component with power management options
 * Elegant icon-only design with keyboard navigation
 */
import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal, Gdk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { getFocusedMonitor } from "../../utils";

// Power management option interface
interface PowerOption {
    label: string;
    text: string;
    command: string;
    key: string;
}

// Available power options with their icons, text, and system commands
const POWER_OPTIONS: PowerOption[] = [
    { label: "󰐥", text: "Apagar", command: "systemctl poweroff", key: "a" },
    { label: "󰜉", text: "Reiniciar", command: "systemctl reboot", key: "r" },
    { label: "󰤄", text: "Suspender", command: "systemctl suspend", key: "s" },
];

/**
 * Shutdown popup with keyboard navigation and power options
 */
export default function ShutdownPopup({ 
    monitor = 0, 
    visible = false 
}: ComponentProps & { visible?: boolean } = {}) {
    let win: Astal.Window;
    const [selectedIndex, setSelectedIndex] = createState(0);
    const [currentMonitor, setCurrentMonitor] = createState(monitor);

    /**
     * Handle power option selection
     */
    function handlePowerAction(optionIndex: number): void {
        const option = POWER_OPTIONS[optionIndex];
        
        if (option) {
            try {
                execAsync(["bash", "-c", option.command]);
                win.visible = false;
            } catch (error) {
                console.error(`Error executing power command: ${option.command}`, error);
            }
        }
    }

    /**
     * Handle keyboard navigation and actions
     */
    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        mod: number,
    ) {
        const keyname = Gdk.keyval_name(keyval) || "";
        
        switch (keyname) {
            case "Escape":
                win.visible = false;
                return;
                
            case "Left":
                setSelectedIndex((prev) => (prev - 1 + POWER_OPTIONS.length) % POWER_OPTIONS.length);
                return;
                
            case "Right":
                setSelectedIndex((prev) => (prev + 1) % POWER_OPTIONS.length);
                return;
                
            case "Return":
            case "space":
                handlePowerAction(selectedIndex);
                return;
                
            default:
                // Check for hotkeys (a, r, s)
                const optionIndex = POWER_OPTIONS.findIndex(option => 
                    option.key.toLowerCase() === keyname.toLowerCase()
                );
                if (optionIndex !== -1) {
                    setSelectedIndex(optionIndex);
                    handlePowerAction(optionIndex);
                }
                return;
        }
    }

    // Expose toggle function globally
    (globalThis as any).toggleShutdown = async () => {
        console.log("Toggling shutdown popup. Current visible:", win.visible);
        
        if (!win.visible) {
            // Get focused monitor before showing
            const focusedMonitor = await getFocusedMonitor();
            setCurrentMonitor(focusedMonitor);
            win.monitor = focusedMonitor;
            console.log("Setting popup to monitor:", focusedMonitor);
        }
        
        win.visible = !win.visible;
        
        if (win.visible) {
            setSelectedIndex(0);
        }
        
        console.log("New visible state:", win.visible);
    };

    return (
        <window
            $={(ref) => (win = ref)}
            name="shutdown-popup"
            visible={visible}
            monitor={currentMonitor}
            anchor={0.5}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            class="shutdown-popup"
            onNotifyVisible={({ visible }) => {
                if (visible) {
                    setSelectedIndex(0);
                    console.log("Shutdown popup is now visible on monitor", currentMonitor);
                } else {
                    console.log("Shutdown popup is now hidden");
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <box 
                class="shutdown-container" 
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
            >
                <label class="shutdown-title" label="Opciones de energía" />
                
                {/* Icon row */}
                <box class="shutdown-icons-row" orientation={Gtk.Orientation.HORIZONTAL}>
                    {POWER_OPTIONS.map((option, index) => (
                        <box
                            class={`shutdown-icon-container ${selectedIndex === index ? 'selected' : ''}`}
                            orientation={Gtk.Orientation.VERTICAL}
                        >
                            <button
                                onClicked={() => handlePowerAction(index)}
                                class={`shutdown-icon-button ${selectedIndex === index ? 'selected' : ''}`}
                            >
                                <label class="shutdown-icon" label={option.label} />
                            </button>
                            <label class="shutdown-label" label={option.text} />
                            <label class="shutdown-key" label={option.key.toUpperCase()} />
                        </box>
                    ))}
                </box>
                
                <label class="shutdown-hint" label="← → para navegar • Enter para seleccionar • Escape para cancelar" />
            </box>
        </window>
    );
}