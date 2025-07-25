/**
 * Bottom bar component displaying currently playing media
 * Shows artist and track information from media players
 */
import { Astal, Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { execAsync } from "ags/process";
import { With } from "ags";
import { ComponentProps } from "../../types";

/**
 * Bottom bar component for media display
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Botbar({ monitor = 0 }: ComponentProps = {}) {
    const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

    // Poll for current track information every second
    const currentTrack = createPoll<string>(
        "",
        1000,
        async (): Promise<string> => {
            try {
                // Get artist and title from playerctl
                const [artistOutput, titleOutput] = await Promise.all([
                    execAsync("playerctl metadata artist").catch(() => ""),
                    execAsync("playerctl metadata title").catch(() => "")
                ]);

                const artist = artistOutput.trim() || "Unknown Artist";
                const title = titleOutput.trim() || "Unknown Title";

                // Return formatted track info if we have valid data
                if (artistOutput.trim() && titleOutput.trim()) {
                    return `${artist} – ${title}`;
                }

                return "";
            } catch (error) {
                console.error("Error getting track info:", error);
                return "";
            }
        }
    );

    return (
        <window
            class="botbar"
            name="botbar"
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={BOTTOM | LEFT | RIGHT}
            visible
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                class="botbar-box"
                spacing={8}
            >
                <With value={currentTrack}>
                    {(track) =>
                        track ? (
                            <box
                                orientation={Gtk.Orientation.HORIZONTAL}
                                spacing={6}
                                valign={Gtk.Align.CENTER}
                                halign={Gtk.Align.CENTER}
                            >
                                {/* Music icon (Nerd Font) */}
                                <label
                                    label="󰝚" // nf-md-music
                                    class="botbar-icon"
                                />

                                {/* Track information */}
                                <label
                                    label={track}
                                    class="botbar-label"
                                    xalign={0.5}
                                    hexpand
                                />
                            </box>
                        ) : null
                    }
                </With>
            </box>
        </window>
    );
}
