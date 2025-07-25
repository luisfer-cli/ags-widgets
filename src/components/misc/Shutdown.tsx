/**
 * Shutdown popup component with power management options
 * Provides circular menu for power off, reboot, and suspend
 */
import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal } from "ags/gtk4";
import { ComponentProps } from "../../types";

// Power management option interface
interface PowerOption {
    label: string;
    command: string;
    angle: number;
}

// Available power options with their icons and system commands
const POWER_OPTIONS: PowerOption[] = [
    { label: "󰐥", command: "systemctl poweroff", angle: 270 },  // Power off
    { label: "󰜉", command: "systemctl reboot", angle: 30 },    // Reboot
    { label: "󰤄", command: "systemctl suspend", angle: 150 },  // Suspend
];

/**
 * Shutdown popup with circular power options
 * @returns JSX window element for shutdown menu
 */
export default function ShutdownPopup({}: ComponentProps = {}) {
    const [visible, setVisible] = createState(true);

    /**
     * Handle power option selection
     * @param optionIndex - Index of selected power option
     */
    function handlePowerAction(optionIndex: number): void {
        const option = POWER_OPTIONS[optionIndex];
        
        if (option) {
            try {
                // Execute system command
                execAsync(["bash", "-c", option.command]);
                
                // Hide popup after selection
                setVisible(false);
            } catch (error) {
                console.error(`Error executing power command: ${option.command}`, error);
            }
        }
    }

    return (
        <window
            name="shutdown-popup"
            visible={visible}
            monitor={0}
            anchor={Astal.WindowAnchor.TOP}
            layer={Astal.Layer.OVERLAY}
            exclusivity={0}
            class="shutdown-popup"
        >
            <box class="circle-container">
                {POWER_OPTIONS.map((option, index) => (
                    <button
                        onClicked={() => handlePowerAction(index)}
                        class={`circle-button angle-${index}`}
                    >
                        <label label={option.label} />
                    </button>
                ))}
            </box>
        </window>
    );
}