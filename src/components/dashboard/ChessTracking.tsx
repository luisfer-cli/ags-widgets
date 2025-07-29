/**
 * Chess tracking widget showing time spent on chess
 * Integrates with TimeWarrior for time tracking
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { ChessStatus } from "../../types";
import { useScript } from "../../utils/hooks";
import { getStatusIcon } from "../../utils";
import { POLL_INTERVALS, SCRIPTS, CSS_CLASSES } from "../../config/constants";

/**
 * Chess time tracking widget
 * Shows current chess session status and duration
 * @returns JSX box element
 */
export default function ChessTracking() {
    // Poll for chess tracking status every second
    const chessStatus = useScript<ChessStatus>(
        SCRIPTS.CHESS_TRACKING,
        POLL_INTERVALS.NORMAL,
        { alt: "pending", current: "", time: "" }
    );

    return (
        <With value={chessStatus}>
            {(status) => (
                <box
                    class={`${CSS_CLASSES.WIDGET} ${status?.alt ?? "pending"}`}
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={6}
                    hexpand
                >
                    {status ? (
                        <label
                            hexpand
                            label={`${getStatusIcon(status.alt)}${status.time}`}
                            class="chess-tracking-label"
                        />
                    ) : (
                        <label
                            hexpand
                            label="❌ Chess tracking error"
                            class="chess-tracking-error"
                        />
                    )}
                </box>
            )}
        </With>
    );
}