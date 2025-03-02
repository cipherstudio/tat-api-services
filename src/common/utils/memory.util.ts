import {
  performance,
  PerformanceObserver,
  PerformanceEntry,
} from 'node:perf_hooks';
import { memoryUsage } from 'node:process';
import { getHeapStatistics } from 'node:v8';

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

export interface HeapStats {
  total_heap_size: number;
  total_heap_size_executable: number;
  total_physical_size: number;
  total_available_size: number;
  used_heap_size: number;
  heap_size_limit: number;
  malloced_memory: number;
  peak_malloced_memory: number;
  does_zap_garbage: number;
  number_of_native_contexts: number;
  number_of_detached_contexts: number;
}

export class MemoryUtil {
  private static observer: PerformanceObserver | null = null;

  /**
   * Initialize memory monitoring
   * @param callback Callback function for memory events
   */
  static initializeMonitoring(
    callback: (entry: PerformanceEntry) => void,
  ): void {
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(callback);
      });

      this.observer.observe({ entryTypes: ['gc'] });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to initialize monitoring:', error.message);
      } else {
        console.error('Failed to initialize monitoring with unknown error');
      }
    }
  }

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): MemoryStats {
    return memoryUsage();
  }

  /**
   * Get heap statistics
   */
  static getHeapStatistics(): HeapStats {
    return getHeapStatistics();
  }

  /**
   * Monitor memory usage over time
   * @param intervalMs Interval in milliseconds
   * @param callback Callback function for memory updates
   */
  static monitorMemoryUsage(
    intervalMs: number,
    callback: (usage: MemoryStats) => void,
  ): NodeJS.Timer {
    return setInterval(() => {
      try {
        callback(this.getMemoryUsage());
      } catch (error) {
        if (error instanceof Error) {
          console.error('Memory monitoring error:', error.message);
        } else {
          console.error('Memory monitoring failed with unknown error');
        }
      }
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  static stopMonitoring(): void {
    if (this.observer) {
      try {
        this.observer.disconnect();
        this.observer = null;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to stop monitoring:', error.message);
        } else {
          console.error('Failed to stop monitoring with unknown error');
        }
      }
    }
  }

  /**
   * Get memory usage formatted as human-readable string
   */
  static getFormattedMemoryUsage(): Record<string, string> {
    try {
      const usage = this.getMemoryUsage();
      return Object.entries(usage).reduce<Record<string, string>>(
        (acc, [key, value]) => ({
          ...acc,
          [key]: `${Math.round((value / 1024 / 1024) * 100) / 100} MB`,
        }),
        {},
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to format memory usage:', error.message);
      } else {
        console.error('Failed to format memory usage with unknown error');
      }
      return {};
    }
  }

  /**
   * Check if memory usage is above threshold
   * @param thresholdMB Threshold in megabytes
   */
  static isMemoryUsageHigh(thresholdMB: number): boolean {
    try {
      const usage = this.getMemoryUsage();
      return usage.heapUsed / 1024 / 1024 > thresholdMB;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to check memory usage:', error.message);
      } else {
        console.error('Failed to check memory usage with unknown error');
      }
      return false;
    }
  }

  /**
   * Measure memory usage of a function
   * @param fn Function to measure
   */
  static async measureMemoryUsage<T>(fn: () => Promise<T>): Promise<{
    result: T;
    memoryDiff: MemoryStats;
    executionTime: number;
  }> {
    try {
      const before = this.getMemoryUsage();
      const start = performance.now();

      const result = await fn();

      const after = this.getMemoryUsage();
      const end = performance.now();

      const memoryDiff: MemoryStats = {
        heapUsed: after.heapUsed - before.heapUsed,
        heapTotal: after.heapTotal - before.heapTotal,
        external: after.external - before.external,
        arrayBuffers: after.arrayBuffers - before.arrayBuffers,
        rss: after.rss - before.rss,
      };

      const executionTime = Math.round(end - start);

      return { result, memoryDiff, executionTime };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Memory measurement failed: ${error.message}`);
      }
      throw new Error('Memory measurement failed with unknown error');
    }
  }
}
