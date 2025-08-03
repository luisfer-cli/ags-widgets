/**
 * Custom hooks for AGS components
 * Provides reusable polling and data fetching logic
 */
import { createPoll } from "ags/time";
import { executeScript } from "./index";

/**
 * Hook for polling script execution with error handling
 * @param scriptName - Name of the script to execute
 * @param interval - Polling interval in milliseconds
 * @param fallback - Fallback value when script fails
 * @returns Pollable value with script output
 */
export function useScript<T>(
    scriptName: string, 
    interval: number = 1000, 
    fallback: T | null = null
) {
    return createPoll<T | null>(
        fallback,
        interval,
        async (): Promise<T | null> => {
            try {
                const data = await executeScript(scriptName);
                return data || fallback;
            } catch (error) {
                // Return fallback silently
                return fallback;
            }
        }
    );
}

/**
 * Hook for polling system commands with JSON parsing
 * @param command - Script name and arguments (e.g., "script.sh arg1 arg2")
 * @param interval - Polling interval in milliseconds
 * @param fallback - Fallback object when parsing fails
 * @returns Pollable value with parsed JSON output
 */
export function useJsonScript<T extends object>(
    command: string,
    interval: number = 1000,
    fallback: T = {} as T
) {
    return createPoll<T>(
        fallback,
        interval,
        async (): Promise<T> => {
            try {
                const parts = command.split(' ');
                const scriptName = parts[0];
                const args = parts.slice(1);
                const result = await executeScript(scriptName, ...args);
                return (typeof result === 'object' && result !== null && !('text' in result)) ? result : fallback;
            } catch (error) {
                // Return fallback silently
                return fallback;
            }
        }
    );
}

/**
 * Hook for polling multiple scripts in parallel
 * @param scripts - Array of script names to execute
 * @param interval - Polling interval in milliseconds
 * @returns Pollable array with all script outputs
 */
export function useMultipleScripts(
    scripts: string[],
    interval: number = 1000
) {
    return createPoll<any[]>(
        [],
        interval,
        async (): Promise<any[]> => {
            try {
                const results = await Promise.allSettled(
                    scripts.map(script => executeScript(script))
                );
                return results.map(result => 
                    result.status === 'fulfilled' ? result.value : null
                );
            } catch (error) {
                // Return empty array silently
                return [];
            }
        }
    );
}