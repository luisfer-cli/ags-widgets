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
        return JSON.parse(output);
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