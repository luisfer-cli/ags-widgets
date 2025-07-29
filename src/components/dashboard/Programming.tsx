/**
 * Programming widget displaying Flowmodoro timer status
 * 
 * Flowmodoro is a productivity technique where work periods are followed
 * by break periods proportional to the work done.
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { FlowmodoroStatus } from "../../types";
import { useScript } from "../../utils/hooks";
import { getStatusIcon } from "../../utils";

/**
 * Programming/Flowmodoro status widget
 * Shows current timer state and remaining time
 * @returns JSX box element
 */
export default function Programming() {
    // Poll for Flowmodoro status every 5 seconds
    const flowmodoroStatus = useScript<FlowmodoroStatus>(
        "flowmodoro.sh",
        5000,
        { alt: "pending", current: "", time: "" }
    );

    return (
        <With value={flowmodoroStatus}>
            {(status) => (
                <box 
                    class="programming" 
                    orientation={Gtk.Orientation.HORIZONTAL} 
                    spacing={6} 
                    hexpand
                >
                    {status ? (
                        <label 
                            hexpand 
                            label={`${getStatusIcon(status.alt)}${status.time}`} 
                        />
                    ) : (
                        <label 
                            label="❌ Script execution error" 
                            hexpand 
                        />
                    )}
                </box>
            )}
        </With>
    );
}