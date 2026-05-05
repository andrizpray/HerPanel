import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

export default function Dashboard({ domains: initialDomains }) {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState(null);
    const [connected, setConnected] = useState(false);
    const [domains, setDomains] = useState(initialDomains || []);
    const [processes, setProcesses] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => { setMounted(true); }, []);

    // Fetch from node_exporter via Nginx reverse proxy
    const fetchNodeExporterMetrics = useCallback(async () => {
        try {
            const response = await fetch(window.location.origin + '/node-exporter/metrics');
            if (response.ok) {
                const text = await response.text();
                const metrics = parseNodeExporterMetrics(text);
                setStats(metrics);
                setLastUpdate(new Date());
            }
        } catch (err) {
            console.error('node_exporter fetch error:', err);
        }
    }, []);

    // Socket.io connection for real-time stats
    useEffect(() => {
        let socket;
        try {
            import('socket.io-client').then(({ io }) => {
                socket = io(window.location.origin, {
                    path: '/socket.io/',
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 5000,
                });
                socket.on('connect', () => { setConnected(true); });
                socket.on('stats', (data) => {
                    setStats(prev => ({ ...prev, ...data }));
                    setLastUpdate(new Date());
                    // Extract process info if available
                    if (data.processes) {
                        setProcesses(data.processes.slice(0, 5));
                    }
                });
                socket.on('disconnect', () => { setConnected(false); });
                socket.on('connect_error', () => { setConnected(false); });
            }).catch(() => { setConnected(false); });
        } catch (err) { setConnected(false); }
        return () => { if (socket) socket.disconnect(); };
    }, []);

    // Fetch domains if not passed initially
    useEffect(() => {
        if (!initialDomains) {
            fetch('/domains', { headers: { 'Accept': 'application/json' } })
                .then(res => res.json())
                .then(data => setDomains(data.props?.domains || []))
                .catch(err => console.error('Failed to fetch domains:', err));
        }
    }, [initialDomains]);

    // Auto-refresh node_exporter metrics
    useEffect(() => {
        fetchNodeExporterMetrics();
        const interval = setInterval(fetchNodeExporterMetrics, 5000);
        return () => clearInterval(interval);
    }, [fetchNodeExporterMetrics]);

    // Parse node_exporter metrics
    const parseNodeExporterMetrics = (text) => {
        const lines = text.split('\n');
        const metrics = {
            cpuUsage: 0,
            memoryTotal: 0,
            memoryUsed: 0,
            memoryUsagePercent: 0,
            diskTotal: 0,
            diskUsed: 0,
            diskUsagePercent: 0,
            networkRxBytes: 0,
            networkTxBytes: 0,
            uptime: 0,
            load1: 0,
            load5: 0,
            load15: 0,
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
            if (line.startsWith('node_disk_total_bytes')) metrics.diskTotal = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_disk_free_bytes')) metrics.diskFree = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load1')) metrics.load1 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load5')) metrics.load5 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load15')) metrics.load15 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_boot_time_seconds')) metrics.bootTime = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_network_receive_bytes_total')) metrics.networkRxBytes += parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_network_transmit_bytes_total')) metrics.networkTxBytes += parseFloat(line.split(' ')[1]);
        });

        const totalCpu = (metrics.cpuIdle || 0) + (metrics.cpuUser || 0) + (metrics.cpuSystem || 0);
        metrics.cpuUsage = totalCpu > 0 ? ((1 - (metrics.cpuIdle || 0) / totalCpu) * 100) : 0;
        metrics.memoryUsed = metrics.memoryTotal - metrics.memoryFree - metrics.memoryCached - metrics.memoryBuffers;
        metrics.memoryUsagePercent = metrics.memoryTotal > 0 ? (metrics.memoryUsed / metrics.memoryTotal * 100) : 0;
        metrics.diskUsed = metrics.diskTotal - metrics.diskFree;
        metrics.diskUsagePercent = metrics.diskTotal > 0 ? (metrics.diskUsed / metrics.diskTotal * 100) : 0;
        metrics.uptime = Date.now() / 1000 - (metrics.bootTime || 0);

        return metrics;
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${mins}m`;
    };

    // Stats for display
    const cpuUsage = stats?.cpuUsage || 0;
    const memoryPercent = stats?.memoryUsagePercent || 0;
    const memoryTotal = stats?.memoryTotal || 0;
    const memoryUsed = stats?.memoryUsed || 0;
    const diskPercent = stats?.diskUsagePercent || 0;
    const diskTotal = stats?.diskTotal || 0;
    const diskUsed = stats?.diskUsed || 0;
    const load1 = stats?.load1 || 0;
    const load5 = stats?.load5 || 0;
    const load15 = stats?.load15 || 0;

    const getBarColor = (pct) => {
        if (pct > 90) return 'bg-red-500';
        if (pct > 70) return 'bg-amber-500';
        return 'bg-hpAccent';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400';
            case 'expiring': return 'bg-amber-500/10 text-amber-400';
            case 'offline': return 'bg-red-500/10 text-red-400';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Dashboard
                </span>
            }
        >
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className={`mb-6 p-5 rounded-lg bg-hpBg2 border border-hpBorder transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Welcome back, {auth.user.name}!</h2>
                        <p className="text-[13px] text-hpText2 mt-1">Here's what's happening with your server today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 ${
                            connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                            {connected ? 'Monitoring Active' : 'Monitoring Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Real Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">CPU Usage</span>
                        <span className="text-hpAccent2">⚡</span>
                    </div>
                    {stats ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{cpuUsage.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(cpuUsage)}`} style={{ width: `${cpuUsage}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px]">
                                <span className="text-hpText3">Load: {load1.toFixed(2)}</span>
                                <span className={cpuUsage > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                    {cpuUsage > 80 ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-hpText3">--</span>
                            <span className="text-[13px] text-hpText3">%</span>
                        </div>
                    )}
                </div>

                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Memory</span>
                        <span className="text-purple-400">◉</span>
                    </div>
                    {stats ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{memoryPercent.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(memoryPercent)}`} style={{ width: `${memoryPercent}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-hpText3">
                                <span>{formatBytes(memoryUsed)} / {formatBytes(memoryTotal)}</span>
                                <span className="text-emerald-400">{formatBytes(memoryTotal - memoryUsed)} free</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-hpText3">--</span>
                            <span className="text-[13px] text-hpText3">%</span>
                        </div>
                    )}
                </div>

                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Disk</span>
                        <span className="text-amber-400">⬡</span>
                    </div>
                    {stats ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-white tabular-nums">{diskPercent.toFixed(1)}</span>
                                <span className="text-[13px] text-hpText3">%</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(diskPercent)}`} style={{ width: `${diskPercent}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-hpText3">
                                <span>{formatBytes(diskUsed)} / {formatBytes(diskTotal)}</span>
                                <span className={diskPercent > 90 ? 'text-red-400' : 'text-emerald-400'}>
                                    {diskPercent > 90 ? '⚠ Critical' : diskPercent > 70 ? '⚡ Warning' : '✓ Healthy'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-hpText3">--</span>
                            <span className="text-[13px] text-hpText3">%</span>
                        </div>
                    )}
                </div>

                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Uptime</span>
                        <span className="text-emerald-400">●</span>
                    </div>
                    {stats ? (
                        <>
                            <div className="text-xl font-semibold text-white mb-1 tabular-nums">{formatUptime(stats.uptime)}</div>
                            <div className="text-[11px] text-hpText3">System running</div>
                            <div className="mt-3 flex items-center gap-1 text-[11px]">
                                <span className="text-hpText3">Load:</span>
                                <span className="text-white font-mono">{load1.toFixed(2)}</span>
                                <span className="text-hpText3">/</span>
                                <span className="text-hpText2 font-mono">{load5.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-xl font-semibold text-hpText3 mb-1">--</div>
                            <div className="text-[11px] text-hpText3">Loading...</div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Domains Panel - Real Data */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] text-white font-medium">Active Domains</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-hpAccent/10 text-hpAccent2 font-medium">
                                {domains.length}
                            </span>
                        </div>
                        <a href={route('domains.create')} className="px-3 py-1.5 rounded-md border border-hpBorder text-[12px] text-hpText2 hover:border-hpAccent hover:text-hpAccent transition-colors">
                            + Add Domain
                        </a>
                    </div>
                    {domains.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-3xl mb-3 opacity-30">◎</div>
                            <div className="text-[13px] text-hpText2 font-medium mb-2">No domains yet</div>
                            <div className="text-[12px] text-hpText3 mb-4">Add your first domain to get started</div>
                            <a href={route('domains.create')} className="inline-flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors">
                                + Add Your First Domain
                            </a>
                        </div>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="bg-hpBg/50">
                                    <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Domain</th>
                                    <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {domains.map((d) => (
                                    <tr key={d.id} className="hover:bg-hpAccent/3 transition-colors">
                                        <td className="px-5 py-3.5 border-b border-hpBorder/50 text-white font-medium">{d.domain_name}</td>
                                        <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusBadge(d.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'active' ? 'bg-emerald-400' : d.status === 'expiring' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                                {d.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Top Processes Panel */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">Top Processes</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {processes.length} shown
                        </span>
                    </div>
                    {processes.length > 0 ? (
                        <div>
                            {processes.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-2.5 border-b border-hpBorder/30 hover:bg-hpAccent/3 transition-colors">
                                    <div className="w-7 h-7 rounded bg-hpBg border border-hpBorder flex items-center justify-center text-[10px] text-hpText3 font-mono">
                                        {p.name?.substring(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="flex-1 text-[13px] text-white font-medium">{p.name || 'Unknown'}</div>
                                    <div className={`text-[12px] font-semibold w-12 text-right ${p.cpu > 50 ? 'text-red-400' : p.cpu > 20 ? 'text-amber-400' : 'text-hpText2'}`}>
                                        {p.cpu?.toFixed(1) || 0}%
                                    </div>
                                    <div className="w-16 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${p.cpu > 50 ? 'bg-red-500' : p.cpu > 20 ? 'bg-amber-500' : 'bg-hpAccent'}`} style={{ width: `${Math.min(p.cpu || 0, 100)}%` }} />
                                    </div>
                                    <div className="text-[11px] text-hpText3 w-16 text-right font-mono">
                                        {p.mem ? `${p.mem} MB` : '--'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="text-[12px] text-hpText3">Process data will appear when monitoring server sends updates</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quick Actions */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-4">
                        {[
                            { icon: '🔄', label: 'Restart' },
                            { icon: '🛡', label: 'Firewall' },
                            { icon: '💾', label: 'Backup' },
                            { icon: '📦', label: 'Packages' },
                            { icon: '🔑', label: 'SSH Keys' },
                            { icon: '📊', label: 'Reports' },
                        ].map((action, i) => (
                            <button key={i} className="border border-hpBorder bg-hpBg rounded-lg p-3 text-center hover:border-hpAccent/30 hover:bg-hpAccent/5 transition-all">
                                <span className="block text-xl mb-1">{action.icon}</span>
                                <span className="text-[11px] text-hpText2">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Disk Usage - Real Data */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">Disk Usage</span>
                    </div>
                    <div className="p-4">
                        {stats ? (
                            <div className="mb-4">
                                <div className="flex justify-between text-[12px] mb-1.5">
                                    <span className="text-hpText2">/ (root)</span>
                                    <span className={`font-semibold ${diskPercent > 90 ? 'text-red-400' : diskPercent > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>{diskPercent.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-hpBorder rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${diskPercent > 90 ? 'bg-red-500' : diskPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${diskPercent}%` }} />
                                </div>
                                <div className="flex justify-between text-[11px] text-hpText3 mt-1">
                                    <span>{formatBytes(diskUsed)} / {formatBytes(diskTotal)}</span>
                                    <span className={diskPercent > 90 ? 'text-red-400' : diskPercent > 70 ? 'text-amber-400' : 'text-emerald-400'}>
                                        {diskPercent > 90 ? '⚠ Critical' : diskPercent > 70 ? '⚡ Warning' : '✓ Healthy'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-[12px] text-hpText3">Loading disk data...</div>
                        )}
                    </div>
                </div>

                {/* System Info - Real Data */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">System Info</span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Uptime</div>
                            <div className="text-[13px] text-white font-mono">{stats ? formatUptime(stats.uptime) : '--'}</div>
                        </div>
                        <div>
                            <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">CPU Usage</div>
                            <div className="text-[13px] text-white font-mono">{stats ? `${cpuUsage.toFixed(1)}%` : '--'}</div>
                        </div>
                        <div>
                            <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Memory</div>
                            <div className="text-[13px] text-white font-mono">{stats ? `${memoryPercent.toFixed(1)}%` : '--'}</div>
                        </div>
                        <div>
                            <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Load Avg</div>
                            <div className="text-[13px] text-white font-mono">{stats ? `${load1.toFixed(2)}` : '--'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
