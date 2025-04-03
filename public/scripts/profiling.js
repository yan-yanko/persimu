/**
 * Profiling Utility for Persimu System
 */

import { performance } from 'perf_hooks';
import { v8 } from 'v8';

class SystemProfiler {
    constructor() {
        this.metrics = {
            functionTimings: new Map(),
            memoryUsage: [],
            apiCalls: new Map(),
            simulationMetrics: new Map()
        };
        this.startTime = null;
    }

    startProfiling() {
        this.startTime = performance.now();
        this.metrics.memoryUsage.push({
            timestamp: Date.now(),
            usage: process.memoryUsage()
        });
    }

    measureFunctionPerformance(functionName, fn) {
        return (...args) => {
            const start = performance.now();
            const result = fn(...args);
            const duration = performance.now() - start;

            if (!this.metrics.functionTimings.has(functionName)) {
                this.metrics.functionTimings.set(functionName, []);
            }
            this.metrics.functionTimings.get(functionName).push(duration);

            if (duration > 500) {
                console.warn(`Slow function detected: ${functionName} took ${duration}ms`);
            }

            return result;
        };
    }

    trackAPICall(endpoint, duration) {
        if (!this.metrics.apiCalls.has(endpoint)) {
            this.metrics.apiCalls.set(endpoint, []);
        }
        this.metrics.apiCalls.get(endpoint).push(duration);
    }

    trackSimulationMetrics(simulationId, metrics) {
        this.metrics.simulationMetrics.set(simulationId, {
            ...metrics,
            timestamp: Date.now()
        });
    }

    getHeapStats() {
        return v8.getHeapStatistics();
    }

    getPerformanceReport() {
        const report = {
            totalRuntime: performance.now() - this.startTime,
            functionPerformance: {},
            apiPerformance: {},
            memoryUsage: this.metrics.memoryUsage,
            simulationMetrics: Array.from(this.metrics.simulationMetrics.entries())
        };

        // Calculate average function timings
        for (const [functionName, timings] of this.metrics.functionTimings) {
            report.functionPerformance[functionName] = {
                average: timings.reduce((a, b) => a + b, 0) / timings.length,
                max: Math.max(...timings),
                min: Math.min(...timings),
                calls: timings.length
            };
        }

        // Calculate API performance
        for (const [endpoint, timings] of this.metrics.apiCalls) {
            report.apiPerformance[endpoint] = {
                average: timings.reduce((a, b) => a + b, 0) / timings.length,
                max: Math.max(...timings),
                min: Math.min(...timings),
                calls: timings.length
            };
        }

        return report;
    }
}

// Cache implementation for API calls
class APICache {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    clear() {
        this.cache.clear();
    }
}

// Performance monitoring system
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            agentResponseTime: [],
            simulationDuration: [],
            tokenUsage: [],
            systemLoad: []
        };
        this.startTime = null;
    }

    startMonitoring() {
        this.startTime = Date.now();
        this.collectSystemMetrics();
    }

    collectSystemMetrics() {
        setInterval(() => {
            this.metrics.systemLoad.push({
                timestamp: Date.now(),
                cpu: process.cpuUsage(),
                memory: process.memoryUsage()
            });
        }, 1000);
    }

    recordAgentResponseTime(duration) {
        this.metrics.agentResponseTime.push({
            timestamp: Date.now(),
            duration
        });
    }

    recordSimulationDuration(duration) {
        this.metrics.simulationDuration.push({
            timestamp: Date.now(),
            duration
        });
    }

    recordTokenUsage(tokens) {
        this.metrics.tokenUsage.push({
            timestamp: Date.now(),
            tokens
        });
    }

    getKPIs() {
        return {
            averageAgentResponseTime: this.calculateAverage(this.metrics.agentResponseTime, 'duration'),
            averageSimulationDuration: this.calculateAverage(this.metrics.simulationDuration, 'duration'),
            averageTokenUsage: this.calculateAverage(this.metrics.tokenUsage, 'tokens'),
            systemLoad: this.metrics.systemLoad
        };
    }

    calculateAverage(metrics, field) {
        if (metrics.length === 0) return 0;
        return metrics.reduce((sum, metric) => sum + metric[field], 0) / metrics.length;
    }
}

export { SystemProfiler, APICache, PerformanceMonitor }; 