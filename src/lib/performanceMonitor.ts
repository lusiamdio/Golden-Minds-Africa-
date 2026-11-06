/**
 * Performance Monitoring Utility for Golden Minds Africa Fellowship Platform
 * Tracks component render / mount timings and network request latency in real-time.
 */

export interface NetworkLogEntry {
  id: string;
  url: string;
  method: string;
  status: number;
  durationMs: number;
  timestamp: number;
  sizeBytes?: number;
  cached?: boolean;
  statusText?: string;
  isSlow?: boolean;
}

export interface ComponentMetricEntry {
  componentName: string;
  mountTimeMs: number;
  renderCount: number;
  lastRenderMs: number;
  avgRenderMs: number;
  totalTimeMs: number;
}

export type NetworkThrottleMode = 'normal' | 'fast-3g' | 'slow-3g' | 'offline';

type PerformanceListener = () => void;

class PerformanceMonitorService {
  private networkLogs: NetworkLogEntry[] = [];
  private componentMetrics: Map<string, ComponentMetricEntry> = new Map();
  private listeners: Set<PerformanceListener> = new Set();
  private throttleMode: NetworkThrottleMode = 'normal';
  private isInitialized = false;
  private maxLogs = 100;

  constructor() {
    this.initNetworkInterceptor();
  }

  public initNetworkInterceptor() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    const self = this;

    // 1. Native PerformanceObserver for resource timings (safe in all browser/iframe contexts)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.entryType === 'resource') {
              const res = entry as PerformanceResourceTiming;
              const durationMs = Math.round(res.duration);
              const url = res.name;
              
              if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                // Avoid logging own telemetry or internal blob URLs
                if (!url.includes('/@vite/') && !url.includes('/@fs/')) {
                  const initiator = res.initiatorType ? res.initiatorType.toUpperCase() : 'REQ';
                  const logEntry: NetworkLogEntry = {
                    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    url,
                    method: initiator === 'FETCH' || initiator === 'XMLHTTPREQUEST' ? 'FETCH' : initiator,
                    status: 200,
                    statusText: 'OK',
                    durationMs,
                    timestamp: Date.now(),
                    sizeBytes: res.transferSize || undefined,
                    isSlow: durationMs > 350
                  };
                  self.addNetworkLog(logEntry);
                }
              }
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (err) {
        // Non-critical fallback
      }
    }

    // 2. Wrap window.fetch safely with try/catch to guard against getter-only properties
    try {
      const originalFetch = window.fetch;
      if (typeof originalFetch === 'function') {
        const customFetch = async function (...args: any[]) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || 'unknown';
          const init = args[1];
          const method = (init?.method || 'GET').toUpperCase();

          // Check offline mode
          if (self.throttleMode === 'offline') {
            const entry: NetworkLogEntry = {
              id: `net-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url,
              method,
              status: 0,
              statusText: 'Offline (Simulated)',
              durationMs: 5,
              timestamp: Date.now(),
              isSlow: true
            };
            self.addNetworkLog(entry);
            throw new Error('Network offline (Simulated by GMA Performance Monitor)');
          }

          // Check simulated throttle delay
          let throttleDelay = 0;
          if (self.throttleMode === 'fast-3g') throttleDelay = 350;
          if (self.throttleMode === 'slow-3g') throttleDelay = 1200;

          const startTime = performance.now();

          try {
            if (throttleDelay > 0) {
              await new Promise((r) => setTimeout(r, throttleDelay));
            }

            const response = await originalFetch.apply(this, args as [RequestInfo, RequestInit?]);
            const durationMs = Math.round(performance.now() - startTime);

            let contentLength = 0;
            try {
              const cl = response.headers.get('content-length');
              if (cl) contentLength = parseInt(cl, 10);
            } catch {
              // Ignore header parsing errors
            }

            const entry: NetworkLogEntry = {
              id: `net-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url,
              method,
              status: response.status,
              statusText: response.statusText || 'OK',
              durationMs,
              timestamp: Date.now(),
              sizeBytes: contentLength || undefined,
              isSlow: durationMs > 350
            };

            self.addNetworkLog(entry);
            return response;
          } catch (err: any) {
            const durationMs = Math.round(performance.now() - startTime);
            const entry: NetworkLogEntry = {
              id: `net-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url,
              method,
              status: 0,
              statusText: err?.message || 'Failed',
              durationMs,
              timestamp: Date.now(),
              isSlow: true
            };
            self.addNetworkLog(entry);
            throw err;
          }
        };

        // Attempt Object.defineProperty or safe assignment without crashing
        try {
          Object.defineProperty(window, 'fetch', {
            value: customFetch,
            writable: true,
            configurable: true
          });
        } catch {
          try {
            (window as any).fetch = customFetch;
          } catch {
            // Getter-only on window, PerformanceObserver handles tracking seamlessly
          }
        }
      }
    } catch {
      // Fetch interception safely ignored if locked by host environment
    }
  }

  public addNetworkLog(entry: NetworkLogEntry) {
    this.networkLogs.unshift(entry);
    if (this.networkLogs.length > this.maxLogs) {
      this.networkLogs.pop();
    }
    this.notify();
  }

  public trackComponentMount(componentName: string, durationMs: number) {
    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.renderCount += 1;
      existing.lastRenderMs = Math.round(durationMs * 10) / 10;
      existing.totalTimeMs += durationMs;
      existing.avgRenderMs = Math.round((existing.totalTimeMs / existing.renderCount) * 10) / 10;
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        mountTimeMs: Math.round(durationMs * 10) / 10,
        renderCount: 1,
        lastRenderMs: Math.round(durationMs * 10) / 10,
        avgRenderMs: Math.round(durationMs * 10) / 10,
        totalTimeMs: durationMs
      });
    }
    this.notify();
  }

  public setThrottleMode(mode: NetworkThrottleMode) {
    this.throttleMode = mode;
    this.notify();
  }

  public getThrottleMode(): NetworkThrottleMode {
    return this.throttleMode;
  }

  public getNetworkLogs(): NetworkLogEntry[] {
    return [...this.networkLogs];
  }

  public getComponentMetrics(): ComponentMetricEntry[] {
    return Array.from(this.componentMetrics.values()).sort((a, b) => b.lastRenderMs - a.lastRenderMs);
  }

  public getSummaryStats() {
    const logs = this.networkLogs;
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        slowCount: 0,
        errorCount: 0
      };
    }

    const durations = logs.map((l) => l.durationMs).sort((a, b) => a - b);
    const sum = durations.reduce((acc, v) => acc + v, 0);
    const p95Idx = Math.floor(durations.length * 0.95);

    return {
      totalRequests: logs.length,
      avgLatencyMs: Math.round(sum / logs.length),
      p95LatencyMs: durations[Math.min(p95Idx, durations.length - 1)],
      slowCount: logs.filter((l) => l.isSlow).length,
      errorCount: logs.filter((l) => l.status === 0 || l.status >= 400).length
    };
  }

  public clearLogs() {
    this.networkLogs = [];
    this.componentMetrics.clear();
    this.notify();
  }

  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const performanceMonitor = new PerformanceMonitorService();
