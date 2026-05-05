import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

export default function Index({ monitoringServerUrl, prometheusUrl }) {
    const [stats, setStats] = useState(null);
    const [prometheusData, setPrometheusData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [prometheusConnected, setPrometheusConnected] = useState(false);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastUpdate, setLastUpdate] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5);

    // Fetch from node_exporter via Nginx reverse proxy (for system metrics)
    const fetchNodeExporterMetrics = useCallback(async () => {
        try {
            // Use relative path to same origin (Nginx proxies /node-exporter/ to localhost:9100)
            const nodeExporterUrl = window.location.origin + '/node-exporter/metrics';
            const response = await fetch(nodeExporterUrl);
            if (response.ok) {
                const text = await response.text();
                const metrics = parseNodeExporterMetrics(text);
                setPrometheusData(metrics);
                setPrometheusConnected(true);
                setLastUpdate(new Date());
            }
        } catch (err) {
            console.error('node_exporter fetch error:', err);
            setPrometheusConnected(false);
        }
    }, []);

    // Fetch from our custom monitoring server (Socket.io)
    useEffect(() => {
        let socket;
        let socketInterval;

        try {
            // Dynamic import for socket.io - connect via Nginx proxy
            const socketUrl = window.location.origin;
            import('socket.io-client').then(({ io }) => {
                socket = io(socketUrl, {
                    path: '/socket.io/',
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 5000,
                });

                socket.on('connect', () => {
                    setConnected(true);
                    setError(null);
                });

                socket.on('stats', (data) => {
                    setStats(data);
                    setLastUpdate(new Date());
                });

                socket.on('disconnect', () => {
                    setConnected(false);
                });

                socket.on('connect_error', () => {
                    setConnected(false);
                });
            }).catch(() => {
                // socket.io not available, rely on Prometheus
                setConnected(false);
            });
        } catch (err) {
            setConnected(false);
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    // Fetch Prometheus metrics
    useEffect(() => {
        fetchNodeExporterMetrics();
        
        if (autoRefresh) {
            const interval = setInterval(fetchNodeExporterMetrics, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [fetchNodeExporterMetrics, autoRefresh, refreshInterval]);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${mins}m`;
    };

    const parseNodeExporterMetrics = (text) => {
        const lines = text.split('\n');
        const metrics = {
            cpuIdle: 0,
            cpuUser: 0,
            cpuSystem: 0,
            memoryTotal: 0,
            memoryFree: 0,
            memoryAvailable: 0,
            memoryBuffers: 0,
            memoryCached: 0,
            diskTotal: 0,
            diskFree: 0,
            diskUsed: 0,
            networkRxBytes: 0,
            networkTxBytes: 0,
            load1: 0,
            load5: 0,
            load15: 0,
            processTotal: 0,
            bootTime: 0,
        };

        lines.forEach(line => {
            if (line.startsWith('node_cpu_seconds_total')) {
                const match = line.match(/mode="(\w+)".*?(\d+\.\d+)/);
                if (match) {
                    if (match[1] === 'idle') metrics.cpuIdle = parseFloat(match[2]);
                    if (match[1] === 'user') metrics.cpuUser = parseFloat(match[2]);
                    if (match[1] === 'system') metrics.cpuSystem = parseFloat(match[2]);
                }
            }
            if (line.startsWith('node_memory_MemTotal_bytes')) {
                metrics.memoryTotal = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_memory_MemFree_bytes')) {
                metrics.memoryFree = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_memory_MemAvailable_bytes')) {
                metrics.memoryAvailable = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_memory_Buffers_bytes')) {
                metrics.memoryBuffers = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_memory_Cached_bytes')) {
                metrics.memoryCached = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_disk_total_bytes')) {
                metrics.diskTotal = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_disk_free_bytes')) {
                metrics.diskFree = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_load1')) {
                metrics.load1 = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_load5')) {
                metrics.load5 = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_load15')) {
                metrics.load15 = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_boot_time_seconds')) {
                metrics.bootTime = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_network_receive_bytes_total')) {
                metrics.networkRxBytes += parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_network_transmit_bytes_total')) {
                metrics.networkTxBytes += parseFloat(line.split(' ')[1]);
            }
        });

        // Calculate CPU usage
        const totalCpu = metrics.cpuIdle + metrics.cpuUser + metrics.cpuSystem;
        metrics.cpuUsage = totalCpu > 0 ? ((1 - metrics.cpuIdle / totalCpu) * 100) : 0;

        // Calculate memory usage
        metrics.memoryUsed = metrics.memoryTotal - metrics.memoryFree - metrics.memoryCached - metrics.memoryBuffers;
        metrics.memoryUsagePercent = metrics.memoryTotal > 0 ? (metrics.memoryUsed / metrics.memoryTotal * 100) : 0;

        // Calculate disk
        metrics.diskUsed = metrics.diskTotal - metrics.diskFree;
        metrics.diskUsagePercent = metrics.diskTotal > 0 ? (metrics.diskUsed / metrics.diskTotal * 100) : 0;

        // Uptime
        metrics.uptime = Date.now() / 1000 - metrics.bootTime;

        return metrics;
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Use data from either source
    const displayData = prometheusData || stats;
    const isConnected = prometheusConnected || connected;

    // Calculate values
    const cpuUsage = displayData?.cpuUsage || 0;
    const memoryTotal = displayData?.memoryTotal || displayData?.memory?.total * 1024 * 1024 * 1024 || 0;
    const memoryUsed = displayData?.memoryUsed || 0;
    const memoryPercent = displayData?.memoryUsagePercent || displayData?.memory?.usagePercent || 0;
    const diskTotal = displayData?.diskTotal || 0;
    const diskUsed = displayData?.diskUsed || 0;
    const diskPercent = displayData?.diskUsagePercent || 0;
    const uptime = displayData?.uptime || displayData?.os?.uptime || 0;
    const load1 = displayData?.load1 || 0;
    const load5 = displayData?.load5 || 0;
    const load15 = displayData?.load15 || 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px] flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        SERVER <span className="text-nexAccent">MONITORING</span>
                    </h1>
                    <p className="page-sub text-[11px] text-nexText2 font-medium mt-2 tracking-[1px]">
                        // Prometheus + node_exporter // Last update: {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) : '—'}
                    </p>
                </div>
            }
        >
            <Head title="Server Monitoring" />

            {/* Connection Status Bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-nexPanel border border-nexBorder">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${prometheusConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="text-[11px] text-nexText2">
                            Prometheus: <span className={prometheusConnected ? 'text-emerald-400' : 'text-red-400'}>{prometheusConnected ? 'Connected' : 'Disconnected'}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
                        <span className="text-[11px] text-nexText2">
                            Socket.IO: <span className={connected ? 'text-cyan-400' : 'text-gray-500'}>{connected ? 'Connected' : 'Offline'}</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-nexText3">Refresh:</span>
                        <select 
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="bg-nexBg2 border border-nexBorder rounded px-2 py-1 text-[10px] text-nexText2 outline-none"
                        >
                            <option value={5}>5s</option>
                            <option value={10}>10s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-[1px] transition-all ${
                            autoRefresh 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-nexBg2 text-nexText3 border border-nexBorder'
                        }`}
                    >
                        {autoRefresh ? '● AUTO' : '○ MANUAL'}
                    </button>
                    <button
                        onClick={fetchNodeExporterMetrics}
                        className="px-3 py-1 rounded-lg bg-nexBg2 border border-nexBorder text-[10px] text-nexText2 hover:border-nexAccent hover:text-nexAccent transition-all"
                    >
                        ↻ REFRESH
                    </button>
                </div>
            </div>

            {!displayData ? (
                <div className="flex items-center justify-center p-20 rounded-xl bg-nexPanel border border-nexBorder">
                    <div className="text-center">
                        <div className="text-4xl mb-4 animate-spin text-nexAccent">◌</div>
                        <div className="text-[13px] text-nexText2 font-medium">Loading metrics from Prometheus...</div>
                        <div className="text-[11px] text-nexText3 mt-1">Connecting to node_exporter on port 9100</div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* CPU */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">CPU Usage</span>
                                <span className="text-cyan-400 text-lg">⚡</span>
                            </div>
                            <div className="font-syne text-3xl font-bold text-white mb-3">
                                {cpuUsage.toFixed(1)}<span className="text-sm font-normal text-nexText2">%</span>
                            </div>
                            <div className="h-2 bg-nexBorder rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        cpuUsage > 90 ? 'bg-red-500' : cpuUsage > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                    }`}
                                    style={{ width: `${cpuUsage}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] text-nexText3">
                                <span>Cores: {stats?.cpu?.cores || 'N/A'}</span>
                                <span className={cpuUsage > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                    {cpuUsage > 80 ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                        </div>

                        {/* Memory */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Memory</span>
                                <span className="text-purple-400 text-lg">◉</span>
                            </div>
                            <div className="font-syne text-3xl font-bold text-white mb-3">
                                {memoryPercent.toFixed(1)}<span className="text-sm font-normal text-nexText2">%</span>
                            </div>
                            <div className="h-2 bg-nexBorder rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        memoryPercent > 90 ? 'bg-red-500' : memoryPercent > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    }`}
                                    style={{ width: `${memoryPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] text-nexText3">
                                <span>{formatBytes(memoryUsed)} / {formatBytes(memoryTotal)}</span>
                                <span className={memoryPercent > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                    {formatBytes(memoryTotal - memoryUsed)} free
                                </span>
                            </div>
                        </div>

                        {/* Disk */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Disk</span>
                                <span className="text-orange-400 text-lg">⬡</span>
                            </div>
                            <div className="font-syne text-3xl font-bold text-white mb-3">
                                {diskPercent.toFixed(1)}<span className="text-sm font-normal text-nexText2">%</span>
                            </div>
                            <div className="h-2 bg-nexBorder rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        diskPercent > 90 ? 'bg-red-500' : diskPercent > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                                    }`}
                                    style={{ width: `${diskPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] text-nexText3">
                                <span>{formatBytes(diskUsed)} / {formatBytes(diskTotal)}</span>
                                <span className={diskPercent > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                    {formatBytes(diskTotal - diskUsed)} free
                                </span>
                            </div>
                        </div>

                        {/* Uptime */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Uptime</span>
                                <span className="text-emerald-400 text-lg">●</span>
                            </div>
                            <div className="font-syne text-2xl font-bold text-white mb-1">
                                {formatUptime(uptime)}
                            </div>
                            <div className="text-[10px] text-nexText3">System running</div>
                            <div className="mt-3 flex items-center gap-1">
                                <span className="text-[10px] text-nexText3">Load:</span>
                                <span className="text-[10px] text-white font-mono">{load1.toFixed(2)}</span>
                                <span className="text-[10px] text-nexText3">/</span>
                                <span className="text-[10px] text-nexText2 font-mono">{load5.toFixed(2)}</span>
                                <span className="text-[10px] text-nexText3">/</span>
                                <span className="text-[10px] text-nexText3 font-mono">{load15.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Network Stats */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-nexBorder flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[11px] text-nexText tracking-[2px] uppercase font-semibold">Network Traffic</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                        <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-2">↓ Download</div>
                                        <div className="text-xl font-syne font-bold text-blue-400">{formatBytes(prometheusData?.networkRxBytes || 0)}</div>
                                        <div className="text-[10px] text-nexText3 mt-1">Total received</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-2">↑ Upload</div>
                                        <div className="text-xl font-syne font-bold text-emerald-400">{formatBytes(prometheusData?.networkTxBytes || 0)}</div>
                                        <div className="text-[10px] text-nexText3 mt-1">Total sent</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-nexBorder flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                <span className="text-[11px] text-nexText tracking-[2px] uppercase font-semibold">System Information</span>
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">OS</div>
                                    <div className="text-[11px] text-white font-medium">{stats?.os?.distro || 'Linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Platform</div>
                                    <div className="text-[11px] text-white font-medium">{stats?.os?.platform || 'linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Kernel</div>
                                    <div className="text-[11px] text-white font-mono">{stats?.os?.release?.split(' ')[0] || 'Linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Architecture</div>
                                    <div className="text-[11px] text-white font-medium">x86_64</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prometheus Metrics Raw */}
                    <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-nexBorder flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-[11px] text-nexText tracking-[2px] uppercase font-semibold">Live Metrics Stream</span>
                            </div>
                            <span className="text-[10px] text-nexText3">node_exporter via Nginx proxy</span>
                        </div>
                        <div className="p-4 max-h-48 overflow-auto">
                            <div className="grid grid-cols-4 gap-3 text-[10px] font-mono">
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">CPU Usage</span>
                                    <div className="text-cyan-400 font-bold mt-1">{cpuUsage.toFixed(2)}%</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Memory Usage</span>
                                    <div className="text-purple-400 font-bold mt-1">{memoryPercent.toFixed(2)}%</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Disk Usage</span>
                                    <div className="text-orange-400 font-bold mt-1">{diskPercent.toFixed(2)}%</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">System Uptime</span>
                                    <div className="text-emerald-400 font-bold mt-1">{formatUptime(uptime)}</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Load Avg (1m)</span>
                                    <div className="text-white font-bold mt-1">{load1.toFixed(2)}</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Load Avg (5m)</span>
                                    <div className="text-white font-bold mt-1">{load5.toFixed(2)}</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Load Avg (15m)</span>
                                    <div className="text-white font-bold mt-1">{load15.toFixed(2)}</div>
                                </div>
                                <div className="p-2 rounded bg-nexBg2 border border-nexBorder">
                                    <span className="text-nexText3">Network RX</span>
                                    <div className="text-blue-400 font-bold mt-1">{formatBytes(prometheusData?.networkRxBytes || 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
