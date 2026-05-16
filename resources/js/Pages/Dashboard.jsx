import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

export default function Dashboard({ domains: initialDomains, stats: serverStats }) {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState(serverStats || null);
    const [error, setError] = useState(null);
    const [domains] = useState(initialDomains || []);
    const [actionLoading, setActionLoading] = useState({});
    const [actionResult, setActionResult] = useState(null);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const parseNodeExporterMetrics = (text) => {
        const lines = text.split('\\n');
        const metrics = { cpuUsage: 0, memoryTotal: 0, memoryUsed: 0, memoryUsagePercent: 0, diskTotal: 0, diskUsed: 0, diskUsagePercent: 0, uptime: 0, load1: 0, load5: 0, load15: 0 };
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
            if (line.startsWith('node_filesystem_size_bytes') && line.includes('mountpoint="/"') && !line.includes('fstype="tmpfs"')) metrics.diskTotal = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_filesystem_free_bytes') && line.includes('mountpoint="/"') && !line.includes('fstype="tmpfs"')) metrics.diskFree = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load1')) metrics.load1 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_load5')) metrics.load5 = parseFloat(line.split(' ')[1]);
            if (line.startsWith('node_boot_time_seconds')) metrics.bootTime = parseFloat(line.split(' ')[1]);
        });
        const totalCpu = (metrics.cpuIdle || 0) + (metrics.cpuUser || 0) + (metrics.cpuSystem || 0);
        metrics.cpuUsage = totalCpu > 0 ? ((1 - (metrics.cpuIdle || 0) / totalCpu) * 100) : 0;
        metrics.memoryUsed = metrics.memoryTotal - metrics.memoryFree - (metrics.memoryTotal - metrics.memoryAvailable);
        metrics.memoryUsagePercent = metrics.memoryTotal > 0 ? (metrics.memoryUsed / metrics.memoryTotal * 100) : 0;
        metrics.diskUsed = metrics.diskTotal - metrics.diskFree;
        metrics.diskUsagePercent = metrics.diskTotal > 0 ? (metrics.diskUsed / metrics.diskTotal * 100) : 0;
        metrics.uptime = Date.now() / 1000 - (metrics.bootTime || 0);
        return metrics;
    };

    const fetchNodeExporterMetrics = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch(window.location.origin + '/node-exporter/metrics');
            if (response.ok) {
                const data = parseNodeExporterMetrics(await response.text());
                // Merge with server stats as fallback
                setStats(prev => ({
                    ...serverStats,
                    ...data,
                }));
            }
            else throw new Error(`HTTP ${response.status}`);
        } catch (err) { 
            // Keep server stats if node exporter fails
            if (serverStats) setStats(serverStats);
            setError(err.message); 
        }
    }, [serverStats]);

    useEffect(() => {
        fetchNodeExporterMetrics();
        const interval = setInterval(fetchNodeExporterMetrics, 5000);
        return () => clearInterval(interval);
    }, [fetchNodeExporterMetrics]);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        return parseFloat((bytes / Math.pow(k, Math.floor(Math.log(bytes) / Math.log(k)))).toFixed(2)) + ' ' + sizes[Math.floor(Math.log(bytes) / Math.log(k))];
    };

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const days = Math.floor(seconds / 86400), hours = Math.floor((seconds % 86400) / 3600), mins = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${mins}m`;
    };

    const handleQuickAction = useCallback(async (action) => {
        setActionLoading(prev => ({ ...prev, [action]: true }));
        setActionResult(null);
        try {
            let response;
            switch (action) {
                case 'restart': response = await fetch(route('quick-actions.restart'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } }); break;
                case 'backup': response = await fetch(route('quick-actions.backup'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } }); break;
                case 'packages': response = await fetch(route('quick-actions.packages')); break;
                case 'ssh-keys': response = await fetch(route('quick-actions.ssh-keys')); break;
                case 'reports': response = await fetch(route('quick-actions.report')); break;
                default: throw new Error('Unknown action');
            }
            const result = await response.json();
            setActionResult({ action, success: result.success, message: result.message || result.report || result.packages });
        } catch (err) {
            setActionResult({ action, success: false, message: err.message });
        } finally { setActionLoading(prev => ({ ...prev, [action]: false })); }
    }, []);

    const getBarColor = (pct) => pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-hpAccent';

    const quickActions = [
        { id: 'restart', icon: '🔄', label: 'Restart', requiresConfirm: true },
        { id: 'firewall', icon: '🛡', label: 'Firewall', route: 'firewall.index' },
        { id: 'backup', icon: '💾', label: 'Backup' },
        { id: 'packages', icon: '📦', label: 'Packages' },
        { id: 'ssh-keys', icon: '🔑', label: 'SSH Keys' },
        { id: 'reports', icon: '📊', label: 'Reports' },
    ];

    return (
        <AuthenticatedLayout header={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" />Dashboard</span>}>
            <Head title="Dashboard" />
            <div className={`mb-6 p-5 rounded-lg bg-hpBg2 border border-hpBorder transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Welcome back, {auth.user.name}!</h2>
                        <p className="text-[13px] text-hpText2 mt-1">Here's your server status (polling every 5s)</p>
                    </div>
                    {stats && (<span className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Monitoring Active</span>)}
                </div>
            </div>
            {error && (<div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">⚠️ Error fetching metrics: {error}. Retrying...</div>)}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Stats cards */}
                {['cpuUsage', 'memoryUsagePercent', 'diskUsagePercent'].map((key, i) => {
                    const labels = { cpuUsage: 'CPU Usage', memoryUsagePercent: 'Memory', diskUsagePercent: 'Disk' };
                    const icons = { cpuUsage: '⚡', memoryUsagePercent: '◉', diskUsagePercent: '⬡' };
                    return stats ? (<div key={i} className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                        <div className="flex items-between justify-between mb-3"><span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">{labels[key]}</span><span className={key === 'cpuUsage' ? 'text-hpAccent2' : key === 'memoryUsagePercent' ? 'text-purple-400' : 'text-amber-400'}>{icons[key]}</span></div>
                        <div className="flex items-baseline gap-1.5"><span className="text-2xl font-semibold text-white tabular-nums">{stats[key].toFixed(1)}</span><span className="text-[13px] text-hpText3">%</span></div>
                        <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(stats[key])}`} style={{ width: `${Math.min(stats[key], 100)}%` }} /></div>
                        <div className="mt-2 flex justify-between text-[11px]"><span className="text-hpText3">{key === 'cpuUsage' ? `Load: ${stats.load1.toFixed(2)}` : key === 'memoryUsagePercent' ? `${formatBytes(stats.memoryUsed)} / ${formatBytes(stats.memoryTotal)}` : `${formatBytes(stats.diskUsed)} / ${formatBytes(stats.diskTotal)}`}</span><span className={stats[key] > 80 ? 'text-red-400' : stats[key] > 70 ? 'text-amber-400' : 'text-emerald-400'}>{stats[key] > 80 ? '⚠ High' : stats[key] > 70 ? '⚡ Warning' : '✓ Normal'}</span></div>
                    </div>) : (<div key={i} className="bg-hpBg2 border border-hpBorder rounded-lg p-5"><span className="text-2xl font-semibold text-hpText3">--</span></div>);
                })}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <div className="flex items-between justify-between mb-3"><span className="text-[12px] text-hpText3 uppercase tracking-wider font-medium">Uptime</span><span className="text-emerald-400">●</span></div>
                    <div className="text-xl font-semibold text-white mb-1 tabular-nums">{formatUptime(stats?.uptime)}</div>
                    <div className="text-[11px] text-hpText3">System running</div>
                </div>
            </div>
            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                    <div className="flex items-center gap-3"><span className="text-[13px] text-white font-medium">Active Domains</span><span className="text-[11px] px-2 py-0.5 rounded bg-hpAccent/10 text-hpAccent2 font-medium">{domains.length}</span></div>
                    <a href={route('domains.create')} className="px-3 py-1.5 rounded-md border border-hpBorder text-[12px] text-hpText2 hover:border-hpAccent hover:text-hpAccent2 transition-colors">+ Add Domain</a>
                </div>
                {domains.length === 0 ? (<div className="p-8 text-center"><div className="text-3xl mb-3 opacity-30">◎</div><div className="text-[13px] text-hpText2 font-medium mb-2">No domains yet</div><a href={route('domains.create')} className="inline-flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium">+ Add Your First Domain</a></div>) : (
                    <table className="w-full text-[13px]"><thead><tr className="bg-hpBg/50"><th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Domain</th><th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th></tr></thead>
                        <tbody>{domains.map((d) => (<tr key={d.id} className="hover:bg-hpAccent/3 transition-colors"><td className="px-5 py-3.5 border-b border-hpBorder/50 text-white font-medium">{d.domain_name}</td><td className="px-5 py-3.5 border-b border-hpBorder/50"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${d.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'expiring' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}><span className={`w-1.5 h-1.5 rounded-full ${d.status === 'active' ? 'bg-emerald-400' : d.status === 'expiring' ? 'bg-amber-400' : 'bg-red-400'}`} />{d.status.toUpperCase()}</span></td></tr>))}</tbody></table>)}
            </div>
            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-hpBorder"><span className="text-[13px] text-white font-medium">Quick Actions</span></div>
                {actionResult && (<div className={`mx-4 mt-3 p-3 rounded-md text-[12px] ${actionResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{actionResult.message}</div>)}
                <div className="grid grid-cols-3 gap-2 p-4">
                    {quickActions.map((action) => (
                        <button key={action.id} onClick={() => {
                            if (action.requiresConfirm && !confirm('Restart server services?')) return;
                            if (action.route) window.location.href = route(action.route);
                            else if (action.id === 'packages') window.location.href = route('packages.index');
                            else if (action.id === 'ssh-keys') window.location.href = route('ssh-keys.index');
                            else if (action.id === 'reports') window.location.href = route('report.index');
                            else handleQuickAction(action.id);
                        }} disabled={actionLoading[action.id]} className="border border-hpBorder bg-hpBg rounded-lg p-3 text-center hover:border-hpAccent/30 hover:bg-hpAccent/5 transition-all disabled:opacity-50">
                            <span className="block text-xl mb-1">{actionLoading[action.id] ? '⏳' : action.icon}</span>
                            <span className="text-[11px] text-hpText2">{actionLoading[action.id] ? 'Processing...' : action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}