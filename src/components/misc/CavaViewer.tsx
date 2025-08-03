/**
 * System-aware audio visualizer component
 * Simulates real audio visualization using system audio activity
 */
import { Astal, Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { useScript } from "../../utils/hooks";
import { SCRIPTS } from "../../config/constants";

interface CavaViewerProps extends ComponentProps {
    orientation?: "horizontal" | "vertical";
    barCount?: number;
}

interface AudioData {
    volume: number;
    playing: number;
    bars: number[];
}

/**
 * Audio level characters for visual representation
 */
const AUDIO_CHARS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "█", "█"];

/**
 * System-aware audio visualizer component
 * @param orientation - Direction of bars (default: horizontal)
 * @param barCount - Number of bars to display (default: 20)
 * @returns JSX box element with realistic audio visualization
 */
export default function CavaViewer({ 
    orientation = "horizontal", 
    barCount = 20
}: CavaViewerProps = {}) {
    
    // Use the new Astal-compatible cava script
    const audioData = useScript<AudioData>(
        SCRIPTS.CAVA_ASTAL,
        150, // Update every 150ms for smooth animation
        { volume: 0, playing: 0, bars: Array(barCount).fill(0) }
    );

    return (
        <box
            class="cava-viewer system-aware"
            orientation={orientation === "vertical" ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL}
            spacing={1}
            valign={Gtk.Align.End}
            halign={Gtk.Align.Center}
        >
            {audioData?.bars?.slice(0, barCount).map((height, index) => {
                // Normalize height to character index (0-10)
                const normalizedHeight = Math.max(0, Math.min(10, Math.floor(height)));
                const char = AUDIO_CHARS[normalizedHeight];
                
                // Check if audio is actually playing
                const isPlaying = (audioData?.playing || 0) > 0;
                const volume = audioData?.volume || 0;
                
                // Dynamic coloring with enhanced logic
                let color = "#4c566a"; // Default (muted)
                
                if (isPlaying && volume > 0) {
                    // More vibrant colors when audio is actually playing
                    if (normalizedHeight >= 8) {
                        color = "#bf616a"; // Red for peak levels
                    } else if (normalizedHeight >= 6) {
                        color = "#d08770"; // Orange for high levels  
                    } else if (normalizedHeight >= 4) {
                        color = "#ebcb8b"; // Yellow for medium-high
                    } else if (normalizedHeight >= 2) {
                        color = "#a3be8c"; // Green for medium
                    } else if (normalizedHeight >= 1) {
                        color = "#88c0d0"; // Blue for low
                    }
                } else {
                    // Muted colors when idle
                    if (normalizedHeight >= 3) {
                        color = "#81a1c1"; // Muted blue
                    } else if (normalizedHeight >= 1) {
                        color = "#5e81ac"; // Darker blue
                    }
                }
                
                // Adjust opacity based on activity
                const baseOpacity = isPlaying ? 1.0 : 0.6;
                const heightOpacity = normalizedHeight > 0 ? 1.0 : 0.3;
                const finalOpacity = baseOpacity * heightOpacity;
                
                // Add subtle animation effect
                const glowIntensity = isPlaying ? normalizedHeight * 0.1 : 0.05;
                
                return (
                    <label
                        class={`cava-bar-char ${isPlaying ? 'playing' : 'idle'}`}
                        label={char}
                        css={`
                            color: ${color};
                            font-size: 14px;
                            font-weight: bold;
                            min-width: 8px;
                            font-family: 'JetBrains Mono', monospace;
                            text-shadow: 0 0 4px ${color}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')};
                            opacity: ${finalOpacity};
                            transition: all 0.1s ease-out;
                        `}
                    />
                );
            }) || Array(barCount).fill(0).map((_, index) => (
                <label
                    class="cava-bar-char loading"
                    label="▁"
                    css={`
                        color: #4c566a;
                        font-size: 14px;
                        font-weight: bold;
                        min-width: 8px;
                        font-family: 'JetBrains Mono', monospace;
                        opacity: 0.3;
                    `}
                />
            ))}
        </box>
    );
}