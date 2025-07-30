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

const POWER_OPTIONS: PowerOption[] = [
    { label: "󰐥", text: "Apagar", command: "systemctl poweroff", key: "a" },
    { label: "󰜉", text: "Reiniciar", command: "systemctl reboot", key: "r" },
    { label: "󰤄", text: "Suspender", command: "systemctl suspend", key: "s" },
];

export default function ShutdownPopup({
    monitor = 0,
    visible = false
}: ComponentProps & { visible?: boolean } = {}) {
    let win: Astal.Window;
    let containerBox: Gtk.Box;
    const [selectedIndex, setSelectedIndex] = createState(0);
    const [currentMonitor, setCurrentMonitor] = createState(monitor);

    /**
     * Handle closing with animation
     */
    function closeWithAnimation() {
        const context = containerBox.get_style_context()
        context?.add_class("animate-out")
        
        setTimeout(() => {
            win.visible = false
            context?.remove_class("animate-out")
        }, 350) // Match animation duration + buffer for icon animations
    }

    function handlePowerAction(optionIndex: number): void {
        const option = POWER_OPTIONS[optionIndex];
        if (option) {
            closeWithAnimation()
            try {
                execAsync(["bash", "-c", option.command]);
            } catch (error) {
                console.error(`Error executing power command: ${option.command}`, error);
            }
        }
    }

    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        _mod: number,
    ) {
        if (keyval === Gdk.KEY_Escape) {
            closeWithAnimation();
            return;
        }
        else if (keyval === Gdk.KEY_Return) {
            handlePowerAction(selectedIndex.get());
            return;
        }
        else if (keyval === Gdk.KEY_space) {
            handlePowerAction(selectedIndex.get());
            return;
        }
        else if (keyval === Gdk.KEY_h) {
            setSelectedIndex((prev) => (prev - 1 + POWER_OPTIONS.length) % POWER_OPTIONS.length);
            return;
        }
        else if (keyval === Gdk.KEY_l) {
            setSelectedIndex((prev) => (prev + 1) % POWER_OPTIONS.length);
            return;
        }
        const keyname = Gdk.keyval_name(keyval) || "";

        switch (keyname) {
            default:
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

    (globalThis as any).toggleShutdown = async () => {
        if (!win.visible) {
            const focusedMonitor = await getFocusedMonitor();
            setCurrentMonitor(focusedMonitor);
            win.monitor = focusedMonitor;
        }

        win.visible = !win.visible;

        if (win.visible) {
            setSelectedIndex(0);
        }
    };

    return (
        <window
            $={(ref) => (win = ref)}
            name="shutdown-popup"
            visible={visible}
            monitor={currentMonitor.get()}
            anchor={0.5}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            class="shutdown-popup"
            onNotifyVisible={({ visible }) => {
                const context = containerBox.get_style_context()

                if (visible) {
                    // Reset animations properly
                    context?.remove_class("animate-in")
                    context?.remove_class("animate-out")
                    setSelectedIndex(0);
                    // Trigger entrance animation with proper delay
                    setTimeout(() => {
                        if (win.visible) { // Extra check to ensure window is still visible
                            context?.add_class("animate-in")
                        }
                    }, 10)
                } else {
                    // Only clean up animate-in when hidden, like launcher
                    context?.remove_class("animate-in")
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <box
                $={(ref) => (containerBox = ref)}
                class="shutdown-container"
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
            >
                <box class="shutdown-icons-row" orientation={Gtk.Orientation.HORIZONTAL}>
                    <box class="shutdown-icons-row" orientation={Gtk.Orientation.HORIZONTAL}>
                        {POWER_OPTIONS.map((option, index) => (
                            <box
                                orientation={Gtk.Orientation.VERTICAL}
                                class={selectedIndex((v) => `shutdown-icon-container ${v === index ? 'selected' : ''}`)}
                            >
                                <button
                                    onClicked={() => handlePowerAction(index)}
                                    class={selectedIndex((v) => `shutdown-icon-button ${v === index ? 'selected' : ''}`)}
                                >
                                    <label class="shutdown-icon" label={option.label} />
                                </button>
                                <label class="shutdown-key" label={option.key.toUpperCase()} />
                            </box>
                        ))}
                    </box>
                </box>
            </box>
        </window>
    );
}

