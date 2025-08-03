/**
 * Bottom bar component displaying currently playing media
 * Shows artist and track information from media players
 */
import { Astal, Gtk } from "ags/gtk4";
import { With } from "ags";
import { ComponentProps, MediaPlayerStatus } from "../../types";
import { useScript } from "../../utils/hooks";

/**
 * Bottom bar component for media display
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Botbar({ monitor = 0 }: ComponentProps = {}) {
    const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

    // Poll for current track information every 2 seconds
    const mediaStatus = useScript<MediaPlayerStatus>(
        "media-player.sh",
        2000,
        { artist: "", title: "", status: "Stopped" }
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
                <With value={mediaStatus}>
                    {(media) => {
                        const hasTrack = media?.artist && media?.title && media?.status !== "Stopped";
                        const trackText = hasTrack 
                            ? `${media.artist} – ${media.title}` 
                            : "♪ No music playing";

                        return (
                            <box
                                orientation={Gtk.Orientation.HORIZONTAL}
                                spacing={6}
                                valign={Gtk.Align.CENTER}
                                halign={Gtk.Align.CENTER}
                                class="media-info"
                            >
                                {/* Music icon */}
                                <label
                                    label="󰝚" // nf-md-music
                                    class="botbar-icon"
                                />

                                {/* Track information */}
                                <label
                                    label={trackText}
                                    class={hasTrack ? "botbar-label" : "botbar-label-empty"}
                                    xalign={0.5}
                                    hexpand
                                />
                                
                                {/* Status indicator */}
                                {hasTrack && (
                                    <label
                                        label={media?.status === "Playing" ? "▶" : "⏸"}
                                        class="botbar-status"
                                    />
                                )}
                            </box>
                        );
                    }}
                </With>
            </box>
        </window>
    );
}
