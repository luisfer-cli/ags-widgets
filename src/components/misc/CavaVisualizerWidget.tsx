/**
 * Brutal Cava Audio Visualizer Widget
 * Real-time audio frequency visualization using correct AGS state patterns
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { useJsonScript } from "../../utils/hooks";

// Brutal characters for maximum visual impact
const BRUTAL_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// Smoothing state for fluid animation
let previousBars: number[] = [];
let smoothingFactor = 0.7; // High responsiveness with minimal lag

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
 * Apply exponential smoothing for fluid animation
 */
function smoothBars(newBars: number[], previousBars: number[]): number[] {
    if (previousBars.length === 0) {
        return newBars;
    }
    
    return newBars.map((newValue, index) => {
        const prevValue = previousBars[index] || 0;
        // More responsive smoothing with faster adaptation to new values
        const smoothed = smoothingFactor * newValue + (1 - smoothingFactor) * prevValue;
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
    
    // Apply smoothing for fluid animation
    const smoothedBars = smoothBars(cavaData.bars, previousBars);
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
 * Brutal Cava Audio Visualizer Widget with Position Support
 * Uses correct AGS patterns for real-time state management
 * Supports left, right, and center positioning
 */
export default function CavaVisualizerWidget({ monitor = 0, position = 'center' }: CavaVisualizerProps = {}) {
    // Use ultra-efficient daemon-based script with optimized polling
    const cavaData = useJsonScript<CavaData>(
        "cava-astal.sh",
        100, // High frequency updates - 100ms = 10 FPS
        { bars: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], volume: 0, playing: 0, method: "fallback" }
    );

    // Different styling based on position
    const getPositionClass = (pos: string, isPlaying: boolean) => {
        const baseClass = `cava-visualizer brutal-cava cava-${pos}`;
        const statusClass = isPlaying ? "cava-active" : "cava-idle";
        return `${baseClass} ${statusClass}`;
    };

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            class={cavaData((data) => {
                const isPlaying = data.playing && data.playing > 0;
                return getPositionClass(position, isPlaying);
            })}
            spacing={position === 'center' ? 2 : 1} // Tighter spacing for left/right
            valign={Gtk.Align.CENTER}
            halign={position === 'left' ? Gtk.Align.END : position === 'right' ? Gtk.Align.START : Gtk.Align.CENTER}
        >
            {position !== 'right' && (
                <label 
                    label="♪" 
                    class={cavaData((data) => {
                        const isPlaying = data.playing && data.playing > 0;
                        return `cava-icon brutal-icon ${isPlaying ? 'playing' : 'idle'}`;
                    })}
                />
            )}
            <label
                label={cavaData((data) => createBrutalVisualization(data, position))}
                class="cava-bars brutal-bars"
                halign={position === 'left' ? Gtk.Align.END : position === 'right' ? Gtk.Align.START : Gtk.Align.CENTER}
                tooltip_text={cavaData((data) => 
                    `Position: ${position} | Method: ${data.method} | Volume: ${data.volume}% | Playing: ${data.playing > 0 ? 'Yes' : 'No'}`
                )}
            />
            {position !== 'left' && (
                <label 
                    label="♪" 
                    class={cavaData((data) => {
                        const isPlaying = data.playing && data.playing > 0;
                        return `cava-icon brutal-icon ${isPlaying ? 'playing' : 'idle'}`;
                    })}
                />
            )}
        </box>
    );
}

/**
 * Real Astal Cava Implementation (comment out simulation above when using this)
 * 
 * import AstalCava from 'gi://AstalCava?version=0.1';
 * 
 * export function createRealCavaWidget() {
 *     const cavaService = AstalCava.get_default();
 *     
 *     if (!cavaService) {
 *         return <label label="CAVA NOT AVAILABLE" class="cava-error" />;
 *     }
 *     
 *     // Configure Cava service
 *     cavaService.set_bars(20);
 *     cavaService.set_framerate(60);
 *     cavaService.set_autosens(true);
 *     cavaService.set_low_cutoff(20);
 *     cavaService.set_high_cutoff(20000);
 *     cavaService.set_source('auto');
 *     
 *     const visualBinding = Variable.derive(
 *         [bind(cavaService, 'values')],
 *         (values) => {
 *             return values
 *                 .map((v: number) => {
 *                     const index = Math.floor(v * BRUTAL_CHARS.length);
 *                     return BRUTAL_CHARS[Math.min(index, BRUTAL_CHARS.length - 1)];
 *                 })
 *                 .join('');
 *         }
 *     );
 *     
 *     return (
 *         <label
 *             label={visualBinding()}
 *             class="cava-bars brutal-bars"
 *         />
 *     );
 * }
 */