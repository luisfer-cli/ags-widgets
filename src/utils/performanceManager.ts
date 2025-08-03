/**
 * Global Performance Manager
 * Centralizes all polling to avoid multiple overlapping timers
 * Implements smart batching and resource throttling
 */
import { createState } from "ags";
import { executeScript } from "./index";

// Global state for all widget data
const globalState = createState<Record<string, any>>({});

// Active polling configurations
interface PollingConfig {
    scriptName: string;
    interval: number;
    lastUpdate: number;
    subscribers: Set<string>;
    priority: 'high' | 'medium' | 'low';
}

class PerformanceManager {
    private pollingConfigs = new Map<string, PollingConfig>();
    private masterTimer: any = null;
    private masterInterval = 50; // 50ms master tick
    private isAnimationFrame = false;

    /**
     * Register a widget for optimized polling
     */
    registerWidget(
        widgetId: string,
        scriptName: string, 
        interval: number, 
        priority: 'high' | 'medium' | 'low' = 'medium'
    ) {
        const key = `${scriptName}-${interval}`;
        
        if (!this.pollingConfigs.has(key)) {
            this.pollingConfigs.set(key, {
                scriptName,
                interval,
                lastUpdate: 0,
                subscribers: new Set(),
                priority
            });
        }
        
        this.pollingConfigs.get(key)!.subscribers.add(widgetId);
        this.startMasterTimer();
        
        return this.getWidgetData(widgetId, scriptName);
    }

    /**
     * Unregister a widget
     */
    unregisterWidget(widgetId: string, scriptName: string, interval: number) {
        const key = `${scriptName}-${interval}`;
        const config = this.pollingConfigs.get(key);
        
        if (config) {
            config.subscribers.delete(widgetId);
            if (config.subscribers.size === 0) {
                this.pollingConfigs.delete(key);
            }
        }
        
        if (this.pollingConfigs.size === 0) {
            this.stopMasterTimer();
        }
    }

    /**
     * Get reactive data for a widget
     */
    getWidgetData(widgetId: string, scriptName: string) {
        return globalState((state) => state[`${scriptName}-${widgetId}`]);
    }

    /**
     * Smart master timer that batches updates
     */
    private startMasterTimer() {
        if (this.masterTimer) return;

        const tick = async () => {
            const now = Date.now();
            const updates: Promise<void>[] = [];

            // Group updates by priority
            const highPriority: PollingConfig[] = [];
            const mediumPriority: PollingConfig[] = [];
            const lowPriority: PollingConfig[] = [];

            for (const config of this.pollingConfigs.values()) {
                if (now - config.lastUpdate >= config.interval) {
                    switch (config.priority) {
                        case 'high': highPriority.push(config); break;
                        case 'medium': mediumPriority.push(config); break;
                        case 'low': lowPriority.push(config); break;
                    }
                }
            }

            // Process high priority first
            for (const config of highPriority) {
                updates.push(this.updateScript(config, now));
            }

            // Throttle medium and low priority updates
            const maxConcurrent = this.isAnimationFrame ? 2 : 4;
            
            for (const config of [...mediumPriority, ...lowPriority].slice(0, maxConcurrent)) {
                updates.push(this.updateScript(config, now));
            }

            await Promise.allSettled(updates);
            
            // Use requestAnimationFrame during animations for smoother performance
            if (this.isAnimationFrame) {
                requestAnimationFrame(tick);
            } else {
                this.masterTimer = setTimeout(tick, this.masterInterval);
            }
        };

        tick();
    }

    private stopMasterTimer() {
        if (this.masterTimer) {
            clearTimeout(this.masterTimer);
            this.masterTimer = null;
        }
    }

    /**
     * Update a specific script and notify subscribers
     */
    private async updateScript(config: PollingConfig, now: number): Promise<void> {
        try {
            const result = await executeScript(config.scriptName);
            config.lastUpdate = now;

            // Update global state for all subscribers
            const currentState = globalState.get();
            const updates: Record<string, any> = {};

            for (const widgetId of config.subscribers) {
                updates[`${config.scriptName}-${widgetId}`] = result;
            }

            globalState.set({ ...currentState, ...updates });
        } catch (error) {
            // Silent fail - widgets will keep their last known state
        }
    }

    /**
     * Enable animation mode for smoother transitions
     */
    setAnimationMode(enabled: boolean) {
        this.isAnimationFrame = enabled;
    }

    /**
     * Get performance stats
     */
    getStats() {
        return {
            activePolls: this.pollingConfigs.size,
            totalSubscribers: Array.from(this.pollingConfigs.values())
                .reduce((sum, config) => sum + config.subscribers.size, 0),
            isAnimationMode: this.isAnimationFrame
        };
    }
}

// Global singleton
export const performanceManager = new PerformanceManager();

/**
 * Optimized hook for high-performance widget polling
 */
export function useOptimizedScript<T>(
    widgetId: string,
    scriptName: string,
    interval: number,
    priority: 'high' | 'medium' | 'low' = 'medium',
    fallback: T | null = null
) {
    const data = performanceManager.registerWidget(widgetId, scriptName, interval, priority);
    
    // Cleanup on component unmount (AGS handles this automatically)
    // performanceManager.unregisterWidget(widgetId, scriptName, interval);
    
    return data((value: any) => value ?? fallback);
}