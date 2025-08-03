/**
 * Media Player Info Widget
 * Displays current track information with play/pause status
 */
import { Gtk } from "ags/gtk4";
import { With } from "ags";
import { ComponentProps, MediaPlayerStatus } from "../../types";
import { useScript } from "../../utils/hooks";

/**
 * Media Player Information Widget
 * Shows artist, title, and playback status
 */
export default function MediaInfoWidget({ monitor = 0 }: ComponentProps = {}) {
    // Poll for current track information every 2 seconds
    const mediaStatus = useScript<MediaPlayerStatus>(
        "media-player.sh",
        2000,
        { artist: "", title: "", status: "Stopped" }
    );

    return (
        <With value={mediaStatus}>
            {(media) => {
                const hasTrack = media?.artist && media?.title && media?.status !== "Stopped";
                const trackText = hasTrack 
                    ? `${media.artist} – ${media.title}` 
                    : "♪ No music playing";

                return (
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={8}
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.CENTER}
                        class="media-info-widget"
                        hexpand
                    >
                        {/* Music icon */}
                        <label
                            label="󰝚" // nf-md-music
                            class={`media-icon ${hasTrack ? 'active' : 'inactive'}`}
                        />

                        {/* Track information */}
                        <label
                            label={trackText}
                            class={hasTrack ? "media-label" : "media-label-empty"}
                            xalign={0.5}
                            hexpand
                            wrap
                            ellipsize={3} // ELLIPSIZE_END
                        />
                    </box>
                );
            }}
         </With>
    );
}