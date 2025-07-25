import { With } from "ags";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import { Gtk } from "ags/gtk4";

type Status = { alt: "pending" | "done" | "progress"; current: string; time: string };

export default function ChessTracking() {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/timewarriorchess.sh`;

    const chessStatus = createPoll<Status | null>(
        { alt: "pending", current: "", time: "" },
        1000,
        async () => {
            return execAsync(scriptPath)
                .then(output => {
                    const json = JSON.parse(output);
                    return {
                        alt: json.alt ?? "pending",
                        current: json.current ?? "",
                        time: json.time ?? "",
                    } satisfies Status;
                })
                .catch(() => null);
        }
    );

    return (
        <With value={chessStatus}>
            {(status) => (
                <box
                    class={`widget ${status?.alt ?? "pending"}`}
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={6}
                    hexpand
                >
                    {status && (
                        <>
                            <label hexpand label={`    ${status.time}`} />
                        </>
                    )}
                </box>
            )}
        </With>
    );
}

