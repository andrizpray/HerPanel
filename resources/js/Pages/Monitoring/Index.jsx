import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

export default function Index({ monitoringServerUrl, prometheusUrl }) {
    const [stats, setStats] = useState(null);
    const [prometheusData, setPrometheusData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [prometheusConnected, setPrometheusConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5);

    // Fetch from node_exporter via Nginx reverse proxy
    const fetchNodeExporterMetrics = useCallback(async () => {
        try {
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

    // Socket.io connection
    useEffect(() => {
        let socket;
        try {
            const socketUrl = window.location.origin;
            import('socket.io-client').then(({ io }) => {
                socket = io(socketUrl, {
                    path: '/socket.io/',
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 5000,
                });
                socket.on('connect', () => { setConnected(true); });
                socket.on('stats', (data) => { setStats(data); setLastUpdate(new Date()); });
                socket.on('disconnect', () => { setConnected(false); });
                socket.on('connect_error', () => { setConnected(false); });
            }).catch(() => { setConnected(false); });
        } catch (err) { setConnected(false); }
        return () => { if (socket) socket.disconnect(); };
    }, []);

    // Auto-refresh
    useEffect(() => {
        fetchNodeExporterMetrics();
        if (autoRefresh) {
            const interval = setInterval(fetchNodeExporterMetrics, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [fetchNodeExporterMetrics, autoRefresh, refreshInterval]);

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
            cpuIdle: 0, cpuUser: 0, cpuSystem: 0,
            memoryTotal: 0, memoryFree: 0, memoryAvailable: 0, memoryBuffers: 0, memoryCached: 0,
            diskTotal: 0, diskFree: 0, diskUsed: 0,
            networkRxBytes: 0, networkTxBytes: 0,
            load1: 0, load5: 0, load15: 0, processTotal: 0, bootTime: 0,
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
            if (line.startsWith('node_memory_MemTotal_bytes')) metrics.memoryTotal = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_memory_MemFree_bytes')) metrics.memoryFree = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_memory_MemAvailable_bytes')) metrics.memoryAvailable = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_memory_Buffers_bytes')) metrics.memoryBuffers = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_memory_Cached_bytes')) metrics.memoryCached = parseFloat(line.split(' ')[1]);
            // Disk usage - node_filesystem metrics (root mountpoint)
            if (line.startsWith('node_filesystem_size_bytes') && line.includes('mountpoint="/"') && !line.includes('fstype="tmpfs"')) {
                metrics.diskTotal = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_filesystem_free_bytes') && line.includes('mountpoint="/"') && !line.includes('fstype="tmpfs"')) {
                metrics.diskFree = parseFloat(line.split(' ')[1]);
            }
            if (line.startsWith('node_load1')) metrics.load1 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load5')) metrics.load5 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load15')) metrics.load15 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_boot_time_seconds')) metrics.bootTime = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_network_receive_bytes_total')) metrics.networkRxBytes += parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_network_transmit_bytes_total')) metrics.networkTxBytes += parseFloat(line.split(' ')[1]);
        });
        const totalCpu = metrics.cpuIdle + metrics.cpuUser + metrics.cpuSystem;
        metrics.cpuUsage = totalCpu > 0 ? ((1 - metrics.cpuIdle / totalCpu) * 100) : 0;
        metrics.memoryUsed = metrics.memoryTotal - metrics.memoryFree - metrics.memoryCached - metrics.memoryBuffers;
        metrics.memoryUsagePercent = metrics.memoryTotal > 0 ? (metrics.memoryUsed / metrics.memoryTotal * 100) : 0;
        metrics.diskUsed = metrics.diskTotal - metrics.diskFree;
        metrics.diskUsagePercent = metrics.diskTotal > 0 ? (metrics.diskUsed / metrics.diskTotal * 100) : 0;
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

    const displayData = prometheusData || stats;
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
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Server Monitoring
                </span>
            }
        >
            <Head title="Server Monitoring" />

            {/* Connection Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-hpBg2 border border-hpBorder">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${prometheusConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-[12px] text-hpText2">
                            Prometheus: <span className={prometheusConnected ? 'text-emerald-400' : 'text-red-400'}>{prometheusConnected ? 'Connected' : 'Disconnected'}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-hpAccent2' : 'bg-slate-600'}`} />
                        <span className="text-[12px] text-hpText2">
                            Socket.IO: <span className={connected ? 'text-hpAccent2' : 'text-slate-500'}>{connected ? 'Connected' : 'Offline'}</span>
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-hpText3">Refresh:</span>
                        <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="bg-hpBg border border-hpBorder rounded-md px-2 py-1 text-[11px] text-hpText2 outline-none focus:border-hpAccent"
                        >
                            <option value={5}>5s</option>
                            <option value={10}>10s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            autoRefresh
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-hpBg text-hpText3 border border-hpBorder'
                        }`}
                    >
                        {autoRefresh ? '● Auto' : '○ Manual'}
                    </button>
                    <button
                        onClick={fetchNodeExporterMetrics}
                        className="px-3 py-1 rounded-md bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:border-hpAccent hover:text-hpAccent transition-colors"
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {!displayData ? (
                <div className="flex items-center justify-center p-20 rounded-lg bg-hpBg2 border border-hpBorder">
                    <div className="text-center">
                        {prometheusConnected ? (
                            <>
                                <div className="text-3xl mb-3 animate-spin text-hpAccent">◌</div>
                                <div className="text-[13px] text-hpText2">Loading metrics from Prometheus...</div>
                                <div className="text-[11px] text-hpText3 mt-1">Connecting to node_exporter</div>
                            </>
                        ) : (
                            <>
                                <div className="text-3xl mb-3 text-red-400">⚠</div>
                                <div className="text-[13px] text-red-400">Failed to connect to node_exporter</div>
                                <div className="text-[11px] text-hpText3 mt-1">Check if node_exporter is running on port 9100</div>
                                <button 
                                    onClick={fetchNodeExporterMetrics}
                                    className="mt-4 px-4 py-2 bg-hpAccent text-white rounded-md text-[12px]"
                                >
                                    Retry Connection
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* CPU */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">CPU Usage</span>
                                <span className="text-hpAccent2">⚡</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{cpuUsage.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${cpuUsage > 90 ? 'bg-red-500' : cpuUsage > 70 ? 'bg-amber-500' : 'bg-hpAccent'}`}
                                    style={{ width: `${cpuUsage}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-hpText3">
                                <span>Cores: {stats?.cpu?.cores || 'N/A'}</span>
                                <span className={cpuUsage > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                    {cpuUsage > 80 ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                        </div>

                        {/* Memory */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Memory</span>
                                <span className="text-purple-400">◉</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{memoryPercent.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${memoryPercent > 90 ? 'bg-red-500' : memoryPercent > 70 ? 'bg-amber-500' : 'bg-purple-500'}`}
                                    style={{ width: `${memoryPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-hpText3">
                                <span>{formatBytes(memoryUsed)} / {formatBytes(memoryTotal)}</span>
                                <span className="text-emerald-400">{formatBytes(memoryTotal - memoryUsed)} free</span>
                            </div>
                        </div>

                        {/* Disk */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Disk</span>
                                <span className="text-amber-400">⬡</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{diskPercent.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${diskPercent > 90 ? 'bg-red-500' : diskPercent > 70 ? 'bg-amber-500' : 'bg-amber-500'}`}
                                    style={{ width: `${diskPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-hpText3">
                                <span>{formatBytes(diskUsed)} / {formatBytes(diskTotal)}</span>
                                <span className="text-emerald-400">{formatBytes(diskTotal - diskUsed)} free</span>
                            </div>
                        </div>

                        {/* Uptime */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Uptime</span>
                                <span className="text-emerald-400">●</span>
                            </div>
                            <div className="text-xl font-semibold text-white mb-1 tabular-nums">{formatUptime(uptime)}</div>
                            <div className="text-[11px] text-hpText3">System running</div>
                            <div className="mt-3 flex items-center gap-1 text-[11px]">
                                <span className="text-hpText3">Load:</span>
                                <span className="text-white font-mono">{load1.toFixed(2)}</span>
                                <span className="text-hpText3">/</span>
                                <span className="text-hpText2 font-mono">{load5.toFixed(2)}</span>
                                <span className="text-hpText3">/</span>
                                <span className="text-hpText3 font-mono">{load15.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Network Stats */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-hpBorder flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-[13px] text-white font-medium">Network Traffic</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                        <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-2">↓ Download</div>
                                        <div className="text-lg font-semibold text-blue-400 tabular-nums">{formatBytes(prometheusData?.networkRxBytes || 0)}</div>
                                        <div className="text-[11px] text-hpText3 mt-1">Total received</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-2">↑ Upload</div>
                                        <div className="text-lg font-semibold text-emerald-400 tabular-nums">{formatBytes(prometheusData?.networkTxBytes || 0)}</div>
                                        <div className="text-[11px] text-hpText3 mt-1">Total sent</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-hpBorder flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                <span className="text-[13px] text-white font-medium">System Information</span>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">OS</div>
                                    <div className="text-[13px] text-white font-medium">{stats?.os?.distro || 'Linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Platform</div>
                                    <div className="text-[13px] text-white font-medium">{stats?.os?.platform || 'linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Kernel</div>
                                    <div className="text-[13px] text-white font-mono">{stats?.os?.release?.split(' ')[0] || 'Linux'}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Architecture</div>
                                    <div className="text-[13px] text-white font-medium">x86_64</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-hpBorder flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-[13px] text-white font-medium">Live Metrics Stream</span>
                            </div>
                            <span className="text-[11px] text-hpText3">node_exporter via Nginx proxy</span>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">CPU Usage</span>
                                    <div className="text-hpAccent2 font-semibold mt-1 tabular-nums">{cpuUsage.toFixed(2)}%</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Memory Usage</span>
                                    <div className="text-purple-400 font-semibold mt-1 tabular-nums">{memoryPercent.toFixed(2)}%</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Disk Usage</span>
                                    <div className="text-amber-400 font-semibold mt-1 tabular-nums">{diskPercent.toFixed(2)}%</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">System Uptime</span>
                                    <div className="text-emerald-400 font-semibold mt-1 tabular-nums">{formatUptime(uptime)}</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Load Avg (1m)</span>
                                    <div className="text-white font-semibold mt-1 font-mono">{load1.toFixed(2)}</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Load Avg (5m)</span>
                                    <div className="text-white font-semibold mt-1 font-mono">{load5.toFixed(2)}</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Load Avg (15m)</span>
                                    <div className="text-white font-semibold mt-1 font-mono">{load15.toFixed(2)}</div>
                                </div>
                                <div className="p-2.5 rounded-md bg-hpBg border border-hpBorder">
                                    <span className="text-hpText3">Network RX</span>
                                    <div className="text-blue-400 font-semibold mt-1 tabular-nums">{formatBytes(prometheusData?.networkRxBytes || 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
