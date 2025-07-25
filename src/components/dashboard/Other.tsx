/**
 * Other/miscellaneous media widget
 * Shows currently playing song information
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";

// Song information interface
interface Song {
    title: string;
}

/**
 * Other media widget showing currently playing song
 * @returns JSX box element
 */
export default function Other() {
    // Poll for current song every 500ms
    const currentSong = createPoll<Song | null>(
        { title: "" }, 
        500, 
        async (): Promise<Song | null> => {
            try {
                // Check if media is playing
                const status = await execAsync(["playerctl", "status"]);
                
                if (!status.includes("Playing")) {
                    return null;
                }

                // Get current title
                const title = await execAsync(["playerctl", "metadata", "title"]);
                return { title: title.trim() };
                
            } catch (error) {
                console.error("Error getting current song:", error);
                return null;
            }
        }
    );

    return (
        <box 
            class="media-widget" 
            orientation={Gtk.Orientation.VERTICAL} 
            spacing={6}
        >
            <label label="🎵 Now Playing:" />

            <With value={currentSong}>
                {(song) => song && (
                    <label 
                        label={song.title} 
                        class="current-song-title"
                    />
                )}
            </With>
        </box>
    );
}