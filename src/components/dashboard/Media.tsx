/**
 * Media widget displaying current media player information
 * Shows player icon, artist, and track title with appropriate icons
 */
import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import Pango from "gi://Pango?version=1.0";
import { executeScript } from "../../utils";

/**
 * Get player icon based on player name
 */
function getPlayerIcon(playerName: string): string {
    const iconMap: Record<string, string> = {
        spotify: " ",
        mpv: "󰎁 ",
        vlc: "󰕼 ",
        firefox: "󰈹 ",
    };
    
    return iconMap[playerName.toLowerCase()] || "󰝚 ";
}

/**
 * Extract part from colon-separated string
 */
function extractPart(value: string, index: number): string {
    const parts = value.split(":");
    return parts.length > index ? parts[index] : "";
}

/**
 * Media information widget
 * Displays current playing media with player icon
 * @returns JSX box element
 */
export default function Media() {
    // Poll for media data every second
    const mediaData = createPoll("media", 1000, async (): Promise<string> => {
        const data = await executeScript("media.sh");
        
        if (!data) {
            return "::"; // Default empty format
        }
        
        const player = data.player || "";
        const artist = data.artist || "";
        const title = data.title || "";
        
        return `${player}:${artist}:${title}`;
    });

    return (
        <box 
            orientation={Gtk.Orientation.HORIZONTAL} 
            spacing={6} 
            class="media" 
            valign={Gtk.Align.CENTER}
        >
            {/* Player icon */}
            <label
                label={mediaData.as(val => getPlayerIcon(extractPart(val, 0)))}
                class="media-icon"
                xalign={0}
            />
            
            {/* Artist and title information */}
            <label
                label={mediaData.as(val => {
                    const artist = extractPart(val, 1);
                    const title = extractPart(val, 2);
                    
                    if (!artist && !title) {
                        return "No media playing";
                    }
                    
                    return artist && title ? `${artist} - ${title}` : artist || title;
                })}
                class="media-info"
                ellipsize={Pango.EllipsizeMode.END}
                wrap={true}
            />
        </box>
    );
}