/**
 * High-Performance Cava Widget
 * Uses all optimization systems for maximum performance
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import { useOptimizedScript } from "../../utils/performanceManager";
import { renderOptimizer, withRenderOptimization } from "../../utils/renderOptimizer";

// Brutal characters for maximum visual impact
const BRUTAL_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

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
 * Ultra-High Performance Cava Audio Visualizer Widget
 * Implements all performance optimizations for smooth animations
 */
export default function CavaVisualizerWidgetOptimized({ 
    monitor = 0, 
    position = 'center' 
}: CavaVisualizerProps = {}) {
    const widgetId = `cava-${position}-${monitor}`;
    
    // Use optimized polling with high priority for cava
    const cavaData = useOptimizedScript<CavaData>(
        widgetId,
        "cava-astal.sh",
        100, // Fast updates when needed
        'high', // High priority for audio visualization
        { bars: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], volume: 0, playing: 0, method: "fallback" }
    );

    // Enable animation mode when cava is active
    const enableAnimationMode = withRenderOptimization((isPlaying: boolean) => {
        renderOptimizer.setAnimationMode(isPlaying);
    });

    /**
     * Optimized visualization creation with minimal allocations
     */
    const createOptimizedVisualization = withRenderOptimization((data: CavaData): string => {
        if (!data?.bars?.length) {
            return "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁";
        }

        // Pre-allocate result array for better performance
        const result = new Array(15);
        
        for (let i = 0; i < Math.min(data.bars.length, 15); i++) {
            const value = data.bars[i];
            const normalized = Math.min(Math.max(value / 8.0, 0), 1);
            const intensity = Math.floor(normalized * 7); // 0-7 range for BRUTAL_CHARS
            result[i] = BRUTAL_CHARS[intensity];
        }
        
        // Fill remaining slots if needed
        for (let i = data.bars.length; i < 15; i++) {
            result[i] = BRUTAL_CHARS[0];
        }
        
        return result.join('');
    });

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            class={cavaData((data) => {
                const isPlaying = data.playing && data.playing > 0;
                enableAnimationMode(isPlaying); // Update animation mode
                return `cava-visualizer brutal-cava cava-${position} ${isPlaying ? "cava-active" : "cava-idle"}`;
            })}
            spacing={position === 'center' ? 2 : 1}
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
                label={cavaData((data) => createOptimizedVisualization(data))}
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