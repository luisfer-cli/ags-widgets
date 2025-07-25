/**
 * Programming widget displaying Flowmodoro timer status
 * 
 * Flowmodoro is a productivity technique where work periods are followed
 * by break periods proportional to the work done.
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { FlowmodoroStatus } from "../../types";
import { executeScript, getStatusIcon } from "../../utils";

/**
 * Programming/Flowmodoro status widget
 * Shows current timer state and remaining time
 * @returns JSX box element
 */
export default function Programming() {
    // Poll for Flowmodoro status every second
    const flowmodoroStatus = createPoll<FlowmodoroStatus | null>(
        null,
        1000,
        async (): Promise<FlowmodoroStatus | null> => {
            const data = await executeScript("flowmodoro.sh");
            
            if (!data) return null;
            
            return {
                alt: data.alt ?? "",
                current: data.current ?? "",
                time: data.time ?? ""
            };
        }
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