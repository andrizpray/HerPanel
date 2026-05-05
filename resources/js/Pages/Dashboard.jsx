import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Static data for display
    const stats = [
        { label: 'CPU Usage', value: '24', unit: '%', bar: 24, sub: '▲ 2.4% vs last hour', status: 'normal' },
        { label: 'RAM Usage', value: '11.4', unit: 'GB', bar: 71, sub: '71% of 16 GB total', status: 'warning' },
        { label: 'Disk I/O', value: '94', unit: '%', bar: 94, sub: '⚠ CRITICAL — /dev/sda1', status: 'danger' },
        { label: 'Bandwidth', value: '2.1', unit: 'TB', bar: 42, sub: '42% of 5 TB quota', status: 'normal' },
    ];

    const domains = [
        { domain: 'example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-11-12', status: 'live' },
        { domain: 'api.example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-11-12', status: 'live' },
        { domain: 'shop.example.id', ssl: '✓ Wildcard', expiry: '2026-05-30', status: 'expiring' },
        { domain: 'dev.example.id', ssl: '✗ None', expiry: '—', status: 'offline' },
        { domain: 'mail.example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-12-01', status: 'live' },
    ];

    const processes = [
        { name: 'nginx', pid: '1024', cpu: '18.4%', mem: '124 MB', bar: 18, level: 'low' },
        { name: 'php-fpm', pid: '2048', cpu: '31.2%', mem: '512 MB', bar: 31, level: 'mid' },
        { name: 'mysqld', pid: '3012', cpu: '22.7%', mem: '2.1 GB', bar: 23, level: 'mid' },
        { name: 'redis-server', pid: '3501', cpu: '4.1%', mem: '88 MB', bar: 4, level: 'low' },
        { name: 'node', pid: '4820', cpu: '67.8%', mem: '340 MB', bar: 68, level: 'high' },
    ];

    const diskItems = [
        { path: '/dev/sda1 (root)', pct: 94, used: '188 GB / 200 GB' },
        { path: '/dev/sdb1 (data)', pct: 67, used: '335 GB / 500 GB' },
        { path: '/dev/sdc1 (backup)', pct: 31, used: '310 GB / 1 TB' },
    ];

    const logItems = [
        { time: '14:32:01', msg: '[nginx] Worker started PID:9102', type: 'ok' },
        { time: '14:31:44', msg: '[php] Warning: max_input exceeded', type: 'warn' },
        { time: '14:30:22', msg: '[disk] sda1 usage critical 94%', type: 'err' },
        { time: '14:28:55', msg: '[ssl] Cert renewed: shop.example.id', type: 'ok' },
        { time: '14:25:10', msg: '[mysql] Slow query 4.2s on orders_db', type: '' },
        { time: '14:20:00', msg: '[fw] Block: 192.168.x.x port 22', type: 'err' },
        { time: '14:15:33', msg: '[backup] Snapshot completed 2.3 GB', type: 'ok' },
        { time: '14:10:12', msg: '[node] Heap usage 78% — PID:4820', type: 'warn' },
    ];

    const getBarColor = (bar, status) => {
        if (status === 'danger' || bar > 90) return 'bg-red-500';
        if (status === 'warning' || bar > 70) return 'bg-amber-500';
        return 'bg-hpAccent';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'live': return 'bg-emerald-500/10 text-emerald-400';
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
                    <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[12px] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        All Systems Operational
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-hpBg2 border border-hpBorder rounded-lg p-5"
                        style={{ animation: mounted ? `fadeUp 0.3s ease both ${idx * 0.05}s` : 'none' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[12px] text-hpText3 font-medium uppercase tracking-wider">{stat.label}</span>
                            {stat.status === 'danger' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold text-white tabular-nums">{stat.value}</span>
                            <span className="text-[13px] text-hpText3">{stat.unit}</span>
                        </div>
                        <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${getBarColor(stat.bar, stat.status)}`}
                                style={{ width: `${stat.bar}%` }}
                            />
                        </div>
                        <div className={`text-[11px] mt-2 ${stat.status === 'danger' ? 'text-red-400' : stat.status === 'warning' ? 'text-amber-400' : 'text-hpText3'}`}>
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Domains Panel */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-white font-medium">Active Domains</span>
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-hpAccent/10 text-hpAccent2 font-medium">
                                {domains.length}
                            </span>
                        </div>
                        <a href={route('domains.create')} className="px-3 py-1.5 rounded-md border border-hpBorder text-[12px] text-hpText2 hover:border-hpAccent hover:text-hpAccent transition-colors">
                            + Add Domain
                        </a>
                    </div>
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Domain</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">SSL</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((d, i) => (
                                <tr key={i} className="hover:bg-hpAccent/3 transition-colors">
                                    <td className="px-5 py-3 border-b border-hpBorder/50 text-white font-medium">{d.domain}</td>
                                    <td className="px-5 py-3 border-b border-hpBorder/50 text-hpText2 text-[12px]">{d.ssl}</td>
                                    <td className="px-5 py-3 border-b border-hpBorder/50">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusBadge(d.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'live' ? 'bg-emerald-400' : d.status === 'expiring' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Processes Panel */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">Top Processes</span>
                        <button className="px-3 py-1.5 rounded-md border border-hpBorder text-[12px] text-hpText2 hover:border-red-500/30 hover:text-red-400 transition-colors">
                            Kill Process
                        </button>
                    </div>
                    <div>
                        {processes.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-2.5 border-b border-hpBorder/30 hover:bg-hpAccent/3 transition-colors">
                                <div className="w-7 h-7 rounded bg-hpBg border border-hpBorder flex items-center justify-center text-[10px] text-hpText3 font-mono">
                                    {p.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 text-[13px] text-white font-medium">{p.name}</div>
                                <div className="text-[11px] text-hpText3 font-mono w-10">{p.pid}</div>
                                <div className={`text-[12px] font-semibold w-12 text-right ${p.level === 'high' ? 'text-red-400' : p.level === 'mid' ? 'text-amber-400' : 'text-hpText2'}`}>
                                    {p.cpu}
                                </div>
                                <div className="w-16 h-1.5 bg-hpBorder rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${p.level === 'high' ? 'bg-red-500' : p.level === 'mid' ? 'bg-amber-500' : 'bg-hpAccent'}`} style={{ width: `${p.bar}%` }} />
                                </div>
                                <div className="text-[11px] text-hpText3 w-16 text-right font-mono">{p.mem}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-3 gap-4">
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

                {/* Disk Usage */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">Disk Usage</span>
                    </div>
                    <div className="p-4">
                        {diskItems.map((d, i) => (
                            <div key={i} className="mb-4 last:mb-0">
                                <div className="flex justify-between text-[12px] mb-1.5">
                                    <span className="text-hpText2">{d.path}</span>
                                    <span className={`font-semibold ${d.pct > 90 ? 'text-red-400' : d.pct > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>{d.pct}%</span>
                                </div>
                                <div className="h-2 bg-hpBorder rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${d.pct > 90 ? 'bg-red-500' : d.pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${d.pct}%` }} />
                                </div>
                                <div className="flex justify-between text-[11px] text-hpText3 mt-1">
                                    <span>{d.used}</span>
                                    <span className={d.pct > 90 ? 'text-red-400' : d.pct > 70 ? 'text-amber-400' : 'text-emerald-400'}>
                                        {d.pct > 90 ? '⚠ Critical' : d.pct > 70 ? '⚡ Warning' : '✓ Healthy'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Log */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                        <span className="text-[13px] text-white font-medium">System Log</span>
                        <button className="px-3 py-1.5 rounded-md border border-hpBorder text-[12px] text-hpText2 hover:border-hpAccent hover:text-hpAccent transition-colors">
                            Clear
                        </button>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto">
                        {logItems.map((l, i) => (
                            <div key={i} className="flex gap-3 px-5 py-2 text-[11px] border-b border-hpBorder/20 hover:bg-hpBg/50 transition-colors">
                                <span className="text-hpText3 font-mono whitespace-nowrap w-14">{l.time}</span>
                                <span className={`flex-1 ${l.type === 'err' ? 'text-red-400' : l.type === 'ok' ? 'text-emerald-400' : l.type === 'warn' ? 'text-amber-400' : 'text-hpText2'}`}>
                                    {l.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
