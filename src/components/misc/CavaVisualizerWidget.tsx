/**
 * Brutal Cava Audio Visualizer Widget
 * Real-time audio frequency visualization using correct AGS state patterns
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { executeScript } from "../../utils";
import { createState } from "ags";

// Brutal characters for maximum visual impact
const BRUTAL_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// Smoothing state for fluid animation - balanced for performance and visual quality
let previousBars: number[] = [];
let smoothingFactor = 0.65; // Balanced smoothing - responsive but not jittery

// Interface for cava script output
interface CavaData {
    bars: number[];
    volume: number;
    playing: number;
    method: string;
}

// Component props extending ComponentProps with position
interface CavaVisualizerProps extends ComponentProps {
    position?: 'left' | 'right' | 'center';
}

/**
 * Apply minimal smoothing with high responsiveness
 */
function smoothBars(newBars: number[], previousBars: number[], isPlaying: boolean = false): number[] {
    if (previousBars.length === 0) {
        return newBars;
    }

    // Use very light smoothing when music is playing for maximum responsiveness
    const adaptiveFactor = isPlaying ? 0.85 : 0.3; // More responsive when playing

    return newBars.map((newValue, index) => {
        const prevValue = previousBars[index] || 0;

        // Skip smoothing for significant changes to maintain punch
        const diff = Math.abs(newValue - prevValue);
        if (diff > 3 && isPlaying) {
            return newValue; // Direct response for big changes
        }

        const smoothed = adaptiveFactor * newValue + (1 - adaptiveFactor) * prevValue;
        return Math.round(smoothed);
    });
}

/**
 * Create brutal visualization from cava data - both left and right show full visualization
 */
function createBrutalVisualization(cavaData: CavaData, position: 'left' | 'right' | 'center' = 'center'): string {
    if (!cavaData || !cavaData.bars || cavaData.bars.length === 0) {
        return "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"; // Full fallback for all positions
    }

    // Apply adaptive smoothing based on playback state
    const isPlaying = cavaData.playing > 0;
    const smoothedBars = smoothBars(cavaData.bars, previousBars, isPlaying);
    previousBars = [...smoothedBars];

    // All positions now show the complete visualization (all 15 bars)
    const barSlice = smoothedBars.slice(0, 15);

    return barSlice
        .map((value: number) => {
            // Normalize value (cava script outputs 0-8 now)
            const normalized = Math.min(Math.max(value / 8.0, 0), 1);
            const intensity = Math.floor(normalized * (BRUTAL_CHARS.length - 1));
            const charIndex = Math.min(intensity, BRUTAL_CHARS.length - 1);
            return BRUTAL_CHARS[charIndex];
        })
        .join('');
}

/**
 * Dynamic polling hook that adjusts frequency based on audio playback state
 */
function useDynamicCavaData(): any {
    const [data, setData] = createState<CavaData>({
        bars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        volume: 0,
        playing: 0,
        method: "fallback"
    });

    let currentInterval = 200; // Start with higher frequency
    let pollTimer: any = null;

    const poll = async () => {
        try {
            const result = await executeScript("cava-astal.sh");
            if (result) {
                const newData = typeof result === 'object' && 'bars' in result ? result as CavaData :
                    { bars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], volume: 0, playing: 0, method: "fallback" };

                setData(newData);

                // More aggressive dynamic interval for better responsiveness
                const newInterval = newData.playing > 0 ? 100 : 350; // Very fast when playing, moderate when idle

                if (newInterval !== currentInterval) {
                    currentInterval = newInterval;
                    // Restart timer with new interval if needed
                    if (pollTimer) {
                        clearTimeout(pollTimer);
                    }
                    pollTimer = setTimeout(poll, currentInterval);
                } else {
                    pollTimer = setTimeout(poll, currentInterval);
                }
            } else {
                pollTimer = setTimeout(poll, currentInterval);
            }
        } catch (error) {
            pollTimer = setTimeout(poll, currentInterval);
        }
    };

    // Start polling
    poll();

    return data;
}
/**
 * Brutal Cava Audio Visualizer Widget with Position Support
 * Uses dynamic polling for optimal performance vs visual quality balance
 * Supports left, right, and center positioning
 */
export default function CavaVisualizerWidget({ monitor = 0, position = 'center' }: CavaVisualizerProps = {}) {
    // Use dynamic polling instead of fixed interval
    const cavaData = useDynamicCavaData();

    // Different styling based on position
    const getPositionClass = (pos: string, isPlaying: boolean) => {
        const baseClass = `cava-visualizer brutal-cava cava-${pos}`;
        const statusClass = isPlaying ? "cava-active" : "cava-idle";
        return `${baseClass} ${statusClass}`;
    };

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            class={cavaData((data: any) => {
                const isPlaying = data.playing && data.playing > 0;
                return getPositionClass(position, isPlaying);
            })}
            spacing={position === 'center' ? 2 : 1} // Tighter spacing for left/right
            valign={Gtk.Align.CENTER}
            halign={position === 'left' ? Gtk.Align.END : position === 'right' ? Gtk.Align.START : Gtk.Align.CENTER}
        >
            <label
                label={cavaData((data: any) => createBrutalVisualization(data, position))}
                class="cava-bars brutal-bars"
                halign={position === 'left' ? Gtk.Align.END : position === 'right' ? Gtk.Align.START : Gtk.Align.CENTER}
                tooltip_text={cavaData((data: any) =>
                    `Position: ${position} | Method: ${data.method} | Volume: ${data.volume}% | Playing: ${data.playing > 0 ? 'Yes' : 'No'}`
                )}
            />
        </box>
    );
}
