import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Download, 
  Zap, 
  Gauge, 
  Layers, 
  X,
  RefreshCw
} from 'lucide-react';
import { 
  performanceMonitor, 
  NetworkLogEntry, 
  ComponentMetricEntry, 
  NetworkThrottleMode 
} from '../lib/performanceMonitor';

export default function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'network' | 'components'>('network');
  const [filterSlowOnly, setFilterSlowOnly] = useState(false);
  const [networkLogs, setNetworkLogs] = useState<NetworkLogEntry[]>([]);
  const [componentMetrics, setComponentMetrics] = useState<ComponentMetricEntry[]>([]);
  const [throttleMode, setThrottleMode] = useState<NetworkThrottleMode>('normal');
  const [stats, setStats] = useState(performanceMonitor.getSummaryStats());

  useEffect(() => {
    const update = () => {
      setNetworkLogs(performanceMonitor.getNetworkLogs());
      setComponentMetrics(performanceMonitor.getComponentMetrics());
      setThrottleMode(performanceMonitor.getThrottleMode());
      setStats(performanceMonitor.getSummaryStats());
    };

    update();
    const unsubscribe = performanceMonitor.subscribe(update);
    return () => unsubscribe();
  }, []);

  const filteredLogs = filterSlowOnly 
    ? networkLogs.filter(l => l.isSlow || l.durationMs > 350)
    : networkLogs;

  const handleExport = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      summary: stats,
      networkLogs,
      componentMetrics
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gma-performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const latencyColor = stats.avgLatencyMs < 250 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
    : stats.avgLatencyMs < 600 
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 ${latencyColor}`}
          title="Open GMA Performance & Latency Monitor"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-mono font-semibold">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : 'Perf Monitor'}
          </span>
          <span className="opacity-60 text-[10px]">|</span>
          <span className="text-[10px] text-gray-300 hidden sm:inline">GMA Latency HUD</span>
          {stats.slowCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] border border-amber-500/40">
              {stats.slowCount} slow
            </span>
          )}
        </button>
      ) : (
        <div className="w-[92vw] sm:w-[480px] md:w-[560px] bg-[#0c120e]/95 border border-[#1e3427] rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col max-h-[82vh] overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 border-b border-[#1c3024] flex items-center justify-between bg-[#0e1712]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                  Performance & Latency Monitor
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182b20] text-[#d4af37] border border-[#234230]">
                    v1.2 Live
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400">Tracking network requests & component render latencies</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Export Performance Diagnostics JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => performanceMonitor.clearLogs()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 p-3 border-b border-[#1c3024] bg-[#090d0b]">
            <div className="bg-[#121c16] p-2 rounded-xl border border-[#1b2f23]">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">Avg Latency</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                {stats.avgLatencyMs} <span className="text-[9px] font-sans text-gray-400 font-normal">ms</span>
              </span>
            </div>
            <div className="bg-[#121c16] p-2 rounded-xl border border-[#1b2f23]">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">p95 Latency</span>
              <span className="text-sm font-mono font-bold text-amber-300 mt-0.5 block">
                {stats.p95LatencyMs} <span className="text-[9px] font-sans text-gray-400 font-normal">ms</span>
              </span>
            </div>
            <div className="bg-[#121c16] p-2 rounded-xl border border-[#1b2f23]">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">Requests</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                {stats.totalRequests}
              </span>
            </div>
            <div className="bg-[#121c16] p-2 rounded-xl border border-[#1b2f23]">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">Slow (&gt;350ms)</span>
              <span className={`text-sm font-mono font-bold mt-0.5 block ${stats.slowCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats.slowCount}
              </span>
            </div>
          </div>

          {/* Controls Bar: Tabs & Throttling */}
          <div className="flex flex-wrap items-center justify-between p-2.5 px-3 border-b border-[#1c3024] bg-[#0c1410] gap-2">
            <div className="flex items-center gap-1 bg-[#14231b] p-0.5 rounded-lg border border-[#1f382a]">
              <button
                onClick={() => setActiveTab('network')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'network' 
                    ? 'bg-[#d4af37] text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Wifi className="w-3 h-3" />
                Network Latency ({networkLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('components')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'components' 
                    ? 'bg-[#d4af37] text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                Components ({componentMetrics.length})
              </button>
            </div>

            {activeTab === 'network' && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterSlowOnly}
                    onChange={(e) => setFilterSlowOnly(e.target.checked)}
                    className="rounded border-gray-600 text-[#d4af37] focus:ring-0 bg-[#16291e]"
                  />
                  <span>Slow only</span>
                </label>

                {/* Network Throttle Simulator */}
                <select
                  value={throttleMode}
                  onChange={(e) => performanceMonitor.setThrottleMode(e.target.value as NetworkThrottleMode)}
                  className="bg-[#14231b] border border-[#213b2c] text-[10px] text-gray-200 rounded px-2 py-1 outline-none focus:border-[#d4af37]"
                  title="Simulate Network Condition"
                >
                  <option value="normal">⚡ Normal Speed</option>
                  <option value="fast-3g">📶 Fast 3G (+350ms)</option>
                  <option value="slow-3g">🐢 Slow 3G (+1200ms)</option>
                  <option value="offline">❌ Offline Mode</option>
                </select>
              </div>
            )}
          </div>

          {/* Logs View Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[380px]">
            {activeTab === 'network' ? (
              filteredLogs.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Wifi className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                  <p>No network requests logged yet.</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Interact with the app to monitor live latencies.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const durationColor = log.durationMs < 200 
                    ? 'text-emerald-400' 
                    : log.durationMs < 500 
                      ? 'text-amber-400' 
                      : 'text-rose-400 font-bold';

                  const cleanUrl = log.url.replace(/^https?:\/\/[^/]+/, '');

                  return (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        log.isSlow 
                          ? 'bg-amber-950/20 border-amber-800/40' 
                          : 'bg-[#101b15] border-[#1a2e22] hover:border-[#254231]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                          log.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                          log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.method === 'PUT' || log.method === 'PATCH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {log.method}
                        </span>

                        <div className="min-w-0">
                          <p className="font-mono text-white text-[11px] truncate" title={log.url}>
                            {cleanUrl || log.url}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-mono text-xs ${durationColor}`}>
                          {log.durationMs}ms
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                          isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {log.status || 'ERR'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              componentMetrics.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Layers className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                  <p>No component render metrics yet.</p>
                </div>
              ) : (
                componentMetrics.map((comp) => (
                  <div key={comp.componentName} className="p-2.5 rounded-xl bg-[#101b15] border border-[#1a2e22] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">{comp.componentName}</span>
                      <span className="text-gray-400 text-[10px]">{comp.renderCount} renders</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                      <div>
                        <span className="text-gray-500 block">Initial Mount</span>
                        <span className="font-mono text-emerald-400">{comp.mountTimeMs}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Last Render</span>
                        <span className="font-mono text-amber-300">{comp.lastRenderMs}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Avg Render</span>
                        <span className="font-mono text-gray-200">{comp.avgRenderMs}ms</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 px-3 border-t border-[#1c3024] bg-[#090d0b] text-[10px] text-gray-400 flex items-center justify-between">
            <span>React Query & Service Worker Active</span>
            <span className="text-[#d4af37]">Real-time Telemetry</span>
          </div>
        </div>
      )}
    </div>
  );
}
