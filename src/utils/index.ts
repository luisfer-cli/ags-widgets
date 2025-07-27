/**
 * Utility functions for AGS components
 */
import { execAsync } from "ags/process";
import GLib from "gi://GLib";

/**
 * Get icon based on status string
 */
export function getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
        pending: "󰒲   ",
        done: "✅",
        progress: "󰒲   ",
        w: "   ",
        b: "   ",
        active: "🟢",
        inactive: "🔴",
        loading: "⏳",
        error: "❌"
    };
    
    return iconMap[status] || "❔";
}

/**
 * Format time string for display
 */
export function formatTime(date: Date = new Date()): string {
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Execute script safely with error handling
 */
export async function executeScript(scriptName: string): Promise<any> {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/${scriptName}`;
    
    try {
        const output = await execAsync(scriptPath);
        
        // Try to parse as JSON first
        try {
            return JSON.parse(output);
        } catch {
            // If not JSON, return as plain text
            return { text: output.trim() };
        }
    } catch (error) {
        console.error(`Error executing script ${scriptName}:`, error);
        return null;
    }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse(jsonString: string, fallback: any = {}): any {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}

/**
 * Clamp number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
    return `${Math.round(clamp(value, 0, 100))}%`;
}

/**
 * Get the currently focused monitor index
 * @returns Promise<number> The index of the focused monitor, or 0 if none found
 */
export async function getFocusedMonitor(): Promise<number> {
    try {
        const monitorsOutput = await execAsync(["hyprctl", "monitors", "-j"]);
        const monitors = safeJsonParse(monitorsOutput, []);
        const focusedMonitor = monitors.findIndex((m: any) => m.focused);
        return Math.max(0, focusedMonitor);
    } catch (error) {
        console.error("Error getting focused monitor:", error);
        return 0;
    }
}