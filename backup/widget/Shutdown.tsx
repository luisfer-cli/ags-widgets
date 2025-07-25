import { createState } from "ags";
import { execAsync } from "ags/process";
import { Gtk, Astal } from "ags/gtk4";

const OPTIONS = [
    { label: "󰐥", command: "systemctl poweroff", angle: 270 },
    { label: "󰜉", command: "systemctl reboot", angle: 30 },
    { label: "󰤄", command: "systemctl suspend", angle: 150 },
];

export default function ShutdownPopup() {
    const [visible, setVisible] = createState(true);

    function handleSelect(index: number) {
        const option = OPTIONS[index];
        if (option) {
            execAsync(["bash", "-c", option.command]);
            setVisible(false);
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
                {OPTIONS.map((opt, i) => (
                    <button
                        onClicked={() => handleSelect(i)}
                        class={`circle-button angle-${i}`}
                    >
                        <label label={opt.label} />
                    </button>
                ))}
            </box>
        </window>
    );
}

