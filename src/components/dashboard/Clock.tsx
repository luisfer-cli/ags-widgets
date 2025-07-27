/**
 * Clock widget showing current time
 * Updates every second with formatted time display
 */
import { createPoll } from "ags/time";
import { formatTime } from "../../utils";

/**
 * Digital clock component with real-time updates
 * @returns JSX box element with time display
 */
export default function Clock() {
    // Track seconds for potential animations/effects
    let seconds = 0;

    // Poll for current time every second
    const time = createPoll(formatTime(), 1000, () => {
        const now = new Date();
        seconds = now.getSeconds();
        return formatTime(now);
    });

    return (
        <box>
            <label label={time} />
        </box>
    );
}