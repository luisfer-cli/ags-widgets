import { createPoll } from "ags/time";

export default function Clock() {
    let seconds = 0;

    const time = createPoll("clock", 1000, () => {
        const now = new Date();
        seconds = now.getSeconds();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    return (
        <box class="clock">
            <label label={time} />
        </box>
    )
}

