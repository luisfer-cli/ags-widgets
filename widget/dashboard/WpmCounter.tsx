import { createPoll } from "ags/time";
import { exec } from "ags/process";

export default function WpmCounter() {
    const wpm = createPoll("wpm", 100, () => {
        try {
            return exec("cat /tmp/current_wpm.txt").trim();
        } catch (err) {
            return "Error";
        }
    });

    return <label class="wpm-counter" label={wpm} />;
}

