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
        pending: "⏳",
        done: "✅",
        progress: "🔄",
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
 * Execute script with arguments safely
 */
export async function executeScript(scriptName: string, ...args: string[]): Promise<any> {
    const scriptPath = `${GLib.get_home_dir()}/.config/ags/scripts/${scriptName}`;
    
    try {
        const output = await execAsync([scriptPath, ...args]);
        
        // Try to parse as JSON first
        try {
            return JSON.parse(output);
        } catch {
            // If not JSON, return as plain text or structured object
            const trimmed = output.trim();
            return trimmed ? { text: trimmed } : null;
        }
    } catch (error) {
        // Silently fail to avoid console spam
        return null;
    }
}

/**
 * Execute script and expect JSON response
 */
export async function executeJsonScript<T = any>(scriptName: string, ...args: string[]): Promise<T | null> {
    try {
        const result = await executeScript(scriptName, ...args);
        return (typeof result === 'object' && result !== null && !('text' in result)) ? result : null;
    } catch (error) {
        // Silently fail to avoid console spam
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
        const result = await executeJsonScript("hyprctl-monitors.sh");
        if (result && Array.isArray(result)) {
            const focusedMonitor = result.findIndex((m: any) => m.focused);
            return Math.max(0, focusedMonitor);
        }
        return 0;
    } catch (error) {
        // Silently fail to avoid console spam
        return 0;
    }
}

// Re-export hooks for convenience
export { useScript, useJsonScript, useMultipleScripts } from './hooks';