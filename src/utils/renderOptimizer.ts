/**
 * Render Optimization Manager
 * Batches DOM updates and optimizes animation frames
 */

class RenderOptimizer {
    private pendingUpdates = new Set<() => void>();
    private isUpdateScheduled = false;
    private animationMode = false;

    /**
     * Schedule a batched update
     */
    scheduleUpdate(updateFn: () => void) {
        this.pendingUpdates.add(updateFn);
        
        if (!this.isUpdateScheduled) {
            this.isUpdateScheduled = true;
            
            if (this.animationMode) {
                requestAnimationFrame(() => this.flushUpdates());
            } else {
                setTimeout(() => this.flushUpdates(), 0);
            }
        }
    }

    /**
     * Flush all pending updates in a single frame
     */
    private flushUpdates() {
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        this.isUpdateScheduled = false;

        // Group similar updates together
        const groupedUpdates = this.groupUpdates(updates);
        
        // Execute updates in optimal order
        for (const group of groupedUpdates) {
            for (const update of group) {
                try {
                    update();
                } catch (error) {
                    console.warn('Update failed:', error);
                }
            }
        }
    }

    /**
     * Group similar updates to minimize reflows
     */
    private groupUpdates(updates: (() => void)[]): (() => void)[][] {
        // Simple grouping - can be enhanced based on update types
        const groups: (() => void)[][] = [];
        const groupSize = Math.min(updates.length, 5); // Max 5 updates per group
        
        for (let i = 0; i < updates.length; i += groupSize) {
            groups.push(updates.slice(i, i + groupSize));
        }
        
        return groups;
    }

    /**
     * Enable/disable animation-optimized rendering
     */
    setAnimationMode(enabled: boolean) {
        this.animationMode = enabled;
    }
}

export const renderOptimizer = new RenderOptimizer();

/**
 * Optimized component update wrapper
 */
export function withRenderOptimization<T extends any[]>(
    updateFn: (...args: T) => void
) {
    return (...args: T) => {
        renderOptimizer.scheduleUpdate(() => updateFn(...args));
    };
}