/**
 * Chess tracking widget showing time spent on chess
 * Integrates with TimeWarrior for time tracking
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { executeScript } from "../../utils";

// Chess tracking status interface
interface ChessStatus {
    alt: "pending" | "done" | "progress";
    current: string;
    time: string;
}

/**
 * Chess time tracking widget
 * Shows current chess session status and duration
 * @returns JSX box element
 */
export default function ChessTracking() {
    // Poll for chess tracking status every second
    const chessStatus = createPoll<ChessStatus | null>(
        { alt: "pending", current: "", time: "" },
        1000,
        async (): Promise<ChessStatus | null> => {
            const data = await executeScript("timewarriorchess.sh");

            if (!data) return null;

            return {
                alt: data.alt ?? "pending",
                current: data.current ?? "",
                time: data.time ?? ""
            };
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
                        <label
                            hexpand
                            label={`    ${status.time}`}
                        />
                    )}
                </box>
            )}
        </With>
    );
}
