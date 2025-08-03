/**
 * Global Performance Configuration
 * Provides easy-to-use performance optimizations for all widgets
 */
import { performanceManager } from "./performanceManager";
import { intelligentCache } from "./intelligentCache";
import { renderOptimizer } from "./renderOptimizer";

export class GlobalPerformanceConfig {
    /**
     * Initialize performance optimizations based on system capabilities
     */
    static initialize() {
        // Detect system performance level
        const performanceLevel = this.detectPerformanceLevel();
        
        switch (performanceLevel) {
            case 'high':
                this.configureHighPerformance();
                break;
            case 'medium':
                this.configureMediumPerformance();
                break;
            case 'low':
                this.configureLowPerformance();
                break;
        }
    }

    /**
     * Detect system performance capabilities
     */
    private static detectPerformanceLevel(): 'high' | 'medium' | 'low' {
        // Simple heuristic - can be enhanced with actual system metrics
        const startTime = performance.now();
        
        // Perform a simple CPU-intensive task
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
            sum += Math.random();
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        if (executionTime < 10) return 'high';
        if (executionTime < 25) return 'medium';
        return 'low';
    }

    /**
     * Configure for high-performance systems
     */
    private static configureHighPerformance() {
        // Enable all optimizations
        renderOptimizer.setAnimationMode(true);
        
        console.log('🚀 High-performance mode enabled');
    }

    /**
     * Configure for medium-performance systems
     */
    private static configureMediumPerformance() {
        // Balanced configuration
        renderOptimizer.setAnimationMode(false);
        
        console.log('⚡ Medium-performance mode enabled');
    }

    /**
     * Configure for low-performance systems
     */
    private static configureLowPerformance() {
        // Conservative settings
        renderOptimizer.setAnimationMode(false);
        
        // Invalidate cache more frequently to save memory
        setInterval(() => {
            intelligentCache.invalidate();
        }, 60000);
        
        console.log('🐢 Low-performance mode enabled');
    }

    /**
     * Get performance statistics
     */
    static getStats() {
        return {
            performance: performanceManager.getStats(),
            cache: intelligentCache.getStats(),
            uptime: process.uptime?.() || 0
        };
    }
}

// Auto-initialize on import
GlobalPerformanceConfig.initialize();