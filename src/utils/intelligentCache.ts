/**
 * Intelligent Caching System
 * Reduces redundant script executions through smart caching
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    hitCount: number;
    ttl: number;
}

class IntelligentCache {
    private cache = new Map<string, CacheEntry<any>>();
    private cleanupTimer: any = null;

    constructor() {
        this.startCleanupTimer();
    }

    /**
     * Get cached data or execute script if needed
     */
    async get<T>(
        key: string,
        executor: () => Promise<T>,
        ttl: number = 1000
    ): Promise<T> {
        const entry = this.cache.get(key);
        const now = Date.now();

        // Return cached data if still valid
        if (entry && (now - entry.timestamp) < entry.ttl) {
            entry.hitCount++;
            return entry.data;
        }

        // Execute and cache
        try {
            const data = await executor();
            this.cache.set(key, {
                data,
                timestamp: now,
                hitCount: entry ? entry.hitCount : 0,
                ttl: this.adaptiveTTL(key, ttl)
            });
            return data;
        } catch (error) {
            // Return stale data if available
            if (entry) {
                return entry.data;
            }
            throw error;
        }
    }

    /**
     * Adaptive TTL based on data volatility
     */
    private adaptiveTTL(key: string, baseTTL: number): number {
        const entry = this.cache.get(key);
        
        if (!entry) return baseTTL;

        // Increase TTL for stable data (high hit count)
        const hitBonus = Math.min(entry.hitCount * 50, baseTTL * 0.5);
        
        // Special cases for different data types
        if (key.includes('cava')) {
            return baseTTL; // Audio data should not be cached too long
        }
        
        if (key.includes('system') || key.includes('monitor')) {
            return baseTTL + hitBonus; // System data can be cached longer
        }

        return baseTTL + hitBonus;
    }

    /**
     * Periodic cleanup of expired entries
     */
    private startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if ((now - entry.timestamp) > entry.ttl * 2) {
                    this.cache.delete(key);
                }
            }
        }, 30000); // Cleanup every 30 seconds
    }

    /**
     * Manual cache invalidation
     */
    invalidate(pattern?: string) {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const entries = Array.from(this.cache.values());
        return {
            size: this.cache.size,
            totalHits: entries.reduce((sum, entry) => sum + entry.hitCount, 0),
            avgHitCount: entries.length ? entries.reduce((sum, entry) => sum + entry.hitCount, 0) / entries.length : 0
        };
    }
}

export const intelligentCache = new IntelligentCache();