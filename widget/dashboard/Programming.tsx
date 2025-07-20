import { With } from "ags";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import { Gtk } from "ags/gtk4";

type FlowmodoroStatus = { alt: string; current: string; time: string } | null;

function getIcon(status: string) {
    switch (status) {
        case "pending":
            return "󰒲   ";
        case "done":
            return "✅";
        case "progress":
            return "🔄";
        case "w":
            return "   ";
        case "b":
            return "   ";
        default:
            return "❔";
    }
}

export default function Programming() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/flowmodoro.sh`;

    const flowmodoroStatus = createPoll<FlowmodoroStatus>(
        null,
        1000,
        () =>
            execAsync(scriptPath)
                .then((output) => {
                    const json = JSON.parse(output);
                    return {
                        alt: json.alt ?? "",
                        current: json.current ?? "",
                        time: json.time ?? "",
                    };
                })
                .catch(() => null)
    );

    return (
        <With value={flowmodoroStatus}>
            {(status) => (
                <box class="programming" orientation={Gtk.Orientation.HORIZONTAL} spacing={6} hexpand>
                    {status ? (
                        <>
                            <label hexpand label={`${getIcon(status.alt)}${status.time}`} />
                        </>
                    ) : (
                        <label label="❌ Error ejecutando script" hexpand />
                    )}
                </box>
            )}
        </With>
    );
}

