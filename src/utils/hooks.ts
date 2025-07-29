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
                // Silently return fallback to avoid console spam
                return fallback;
            }
        }
    );
}

/**
 * Hook for polling system commands with JSON parsing
 * @param scriptName - Name of the script to execute  
 * @param interval - Polling interval in milliseconds
 * @param fallback - Fallback object when parsing fails
 * @returns Pollable value with parsed JSON output
 */
export function useJsonScript<T extends object>(
    scriptName: string,
    interval: number = 1000,
    fallback: T = {} as T
) {
    return createPoll<T>(
        fallback,
        interval,
        async (): Promise<T> => {
            try {
                const result = await executeScript(scriptName);
                return (typeof result === 'object' && result !== null) ? result : fallback;
            } catch (error) {
                // Silently return fallback to avoid console spam
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
                const results = await Promise.all(
                    scripts.map(script => 
                        executeScript(script).catch(() => null)
                    )
                );
                return results;
            } catch (error) {
                // Silently return empty array to avoid console spam
                return [];
            }
        }
    );
}