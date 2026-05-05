import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    // Static data for display
    const stats = [
        { 
            label: 'CPU Usage', 
            value: '24', 
            unit: '%', 
            icon: '⚡', 
            bar: 24, 
            sub: '▲ 2.4% vs last hour',
            subType: 'up',
            color: 'from-cyan-500 to-blue-500',
            glow: 'shadow-cyan-500/20'
        },
        { 
            label: 'RAM Usage', 
            value: '11.4', 
            unit: 'GB', 
            icon: '◉', 
            bar: 71, 
            sub: '71% of 16 GB total',
            subType: 'dn',
            barClass: 'warn',
            color: 'from-purple-500 to-pink-500',
            glow: 'shadow-purple-500/20'
        },
        { 
            label: 'Disk I/O', 
            value: '94', 
            unit: '%', 
            icon: '⬡', 
            bar: 94, 
            sub: '⚠ CRITICAL — /dev/sda1',
            subType: 'dn',
            barClass: 'danger',
            color: 'from-orange-500 to-red-500',
            glow: 'shadow-orange-500/20',
            alert: true
        },
        { 
            label: 'Bandwidth', 
            value: '2.1', 
            unit: 'TB', 
            icon: '⬢', 
            bar: 42, 
            sub: '42% of 5 TB quota',
            subType: 'up',
            color: 'from-emerald-500 to-teal-500',
            glow: 'shadow-emerald-500/20'
        },
    ];

    const domains = [
        { domain: 'example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-11-12', status: 'LIVE', statusClass: 'live' },
        { domain: 'api.example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-11-12', status: 'LIVE', statusClass: 'live' },
        { domain: 'shop.example.id', ssl: '✓ Wildcard', expiry: '2026-05-30', status: 'EXPIRING', statusClass: 'exp' },
        { domain: 'dev.example.id', ssl: '✗ None', expiry: '—', status: 'OFFLINE', statusClass: 'off' },
        { domain: 'mail.example.id', ssl: '✓ Let\'s Encrypt', expiry: '2026-12-01', status: 'LIVE', statusClass: 'live' },
    ];

    const processes = [
        { name: 'nginx', pid: '1024', cpu: '18.4%', mem: '124 MB', bar: 18 },
        { name: 'php-fpm', pid: '2048', cpu: '31.2%', mem: '512 MB', bar: 31, barClass: 'med' },
        { name: 'mysqld', pid: '3012', cpu: '22.7%', mem: '2.1 GB', bar: 23, barClass: 'med' },
        { name: 'redis-server', pid: '3501', cpu: '4.1%', mem: '88 MB', bar: 4 },
        { name: 'node', pid: '4820', cpu: '67.8%', mem: '340 MB', bar: 68, barClass: 'hi' },
    ];

    const diskItems = [
        { path: '/dev/sda1 (root)', pct: 94, pctClass: 'text-red-400', fillClass: 'from-red-600 to-red-400', used: '188 GB / 200 GB' },
        { path: '/dev/sdb1 (data)', pct: 67, pctClass: 'text-yellow-400', fillClass: 'from-yellow-600 to-yellow-400', used: '335 GB / 500 GB' },
        { path: '/dev/sdc1 (backup)', pct: 31, pctClass: 'text-emerald-400', fillClass: 'from-emerald-600 to-emerald-400', used: '310 GB / 1 TB' },
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

    const quickActions = [
        { icon: '🔄', label: 'Restart', color: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20' },
        { icon: '🛡', label: 'Firewall', color: 'hover:border-red-500/50 hover:shadow-red-500/20' },
        { icon: '💾', label: 'Backup', color: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20' },
        { icon: '📦', label: 'Packages', color: 'hover:border-purple-500/50 hover:shadow-purple-500/20' },
        { icon: '🔑', label: 'SSH Keys', color: 'hover:border-yellow-500/50 hover:shadow-yellow-500/20' },
        { icon: '📊', label: 'Reports', color: 'hover:border-blue-500/50 hover:shadow-blue-500/20' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px] flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        SERVER <span className="text-nexAccent">OVERVIEW</span>
                        <span className="cursor-blink w-0.5 h-6 bg-nexAccent animate-pulse ml-1" />
                    </h1>
                    <p className="page-sub text-[11px] text-nexText2 font-medium mt-2 tracking-[1px]">
                        // LAST SYNC: <span className="text-nexAccent">{currentTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }).replace(/\//g, ' — ')}</span> WIB
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r from-nexPanel to-nexBg2 border border-nexBorder transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-syne font-bold text-white">Welcome back, {auth.user.name}!</h2>
                        <p className="text-[11px] text-nexText2 mt-1">Here's what's happening with your server today.</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">● All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid grid grid-cols-4 gap-4 mb-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        onMouseEnter={() => setHoveredCard(idx)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`stat-card bg-nexPanel border border-nexBorder rounded-xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer
                            ${hoveredCard === idx ? 'border-nexBorder2 shadow-xl ' + stat.glow + ' -translate-y-1' : ''}
                            ${stat.alert ? 'border-red-500/30' : ''}`}
                        style={{ 
                            animation: mounted ? `fadeUp 0.5s ease both ${idx * 0.08}s` : 'none',
                            transform: hoveredCard === idx ? 'translateY(-4px)' : 'translateY(0)'
                        }}
                    >
                        {/* Animated gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 ${hoveredCard === idx ? 'opacity-5' : ''}`} />
                        
                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-30
                            ${stat.barClass === 'danger' ? 'text-red-400' : 'text-cyan-400'}`} />

                        <div className="stat-label text-[10px] tracking-[2px] text-nexText2 uppercase mb-3 font-semibold flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${stat.alert ? 'bg-red-400 animate-pulse' : 'bg-cyan-400'}`} />
                            {stat.label}
                        </div>
                        
                        <div className="stat-value font-syne text-3xl font-extrabold text-white leading-none flex items-baseline gap-2">
                            <span className={hoveredCard === idx ? 'text-white' : ''}>{stat.value}</span>
                            <span className="text-sm font-normal text-nexText2">{stat.unit}</span>
                        </div>
                        
                        <div className={`stat-bar mt-3 h-[4px] bg-nexBorder rounded-full overflow-hidden`}>
                            <div
                                className={`stat-bar-fill h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ${stat.barClass === 'warn' ? 'from-orange-500 to-yellow-400' : stat.barClass === 'danger' ? 'from-red-600 to-red-400' : ''}`}
                                style={{ width: `${stat.bar}%` }}
                            />
                        </div>
                        
                        <div className={`stat-sub text-[10px] mt-2 ${stat.subType === 'up' ? 'text-emerald-400' : stat.alert ? 'text-red-400' : 'text-nexText2'}`}>
                            {stat.sub}
                        </div>

                        {/* Icon */}
                        <div className="stat-icon absolute right-4 top-4 text-3xl opacity-10">
                            {stat.icon}
                        </div>

                        {/* Interactive indicator */}
                        <div className={`absolute bottom-2 right-2 text-[8px] text-nexText3 transition-opacity ${hoveredCard === idx ? 'opacity-100' : 'opacity-0'}`}>
                            CLICK FOR DETAILS →
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="main-grid grid grid-cols-2 gap-4 mb-4">
                {/* Domains Panel */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-5 py-4 border-b border-nexBorder text-[11px] text-nexText tracking-[2px] uppercase font-semibold">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-nexText">Active Domains</span>
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-nexAccent/10 text-nexAccent border border-nexAccent/20">
                                {domains.length}
                            </span>
                        </div>
                        <a href={route('domains.create')} className="panel-action bg-transparent border border-nexBorder text-nexText2 text-[10px] px-3 py-1 rounded-lg cursor-pointer font-mono tracking-[1px] transition-all duration-200 hover:border-nexAccent hover:text-nexAccent hover:bg-nexAccent/5">
                            + ADD DOMAIN
                        </a>
                    </div>
                    <table className="domain-table w-full text-[11px]">
                        <thead>
                            <tr className="bg-nexBg2/50">
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase p-3 text-left border-b border-nexBorder font-semibold">Domain</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase p-3 text-left border-b border-nexBorder font-semibold">SSL</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase p-3 text-left border-b border-nexBorder font-semibold">Expiry</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase p-3 text-left border-b border-nexBorder font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((d, i) => (
                                <tr key={i} className="hover:bg-nexAccent/5 transition-colors cursor-pointer">
                                    <td className="p-3 border-b border-nexBorder/50 text-nexText font-medium">{d.domain}</td>
                                    <td className="p-3 border-b border-nexBorder/50 text-nexText2 text-[10px]">{d.ssl}</td>
                                    <td className="p-3 border-b border-nexBorder/50 text-nexText2 text-[10px]">{d.expiry}</td>
                                    <td className="p-3 border-b border-nexBorder/50">
                                        <span className={`status-badge inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-[1px]
                                            ${d.statusClass === 'live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                              d.statusClass === 'exp' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                              'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Processes Panel */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-5 py-4 border-b border-nexBorder text-[11px] text-nexText tracking-[2px] uppercase font-semibold">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-nexText">Top Processes</span>
                        </div>
                        <button className="panel-action bg-transparent border border-nexBorder text-nexText2 text-[10px] px-3 py-1 rounded-lg cursor-pointer font-mono tracking-[1px] transition-all duration-200 hover:border-red-500 hover:text-red-400 hover:bg-red-500/5">
                            KILL PROCESS
                        </button>
                    </div>
                    <div className="process-list">
                        {processes.map((p, i) => (
                            <div key={i} className="process-item flex items-center gap-3 px-5 py-2.5 border-b border-nexBorder/30 text-[11px] hover:bg-nexAccent/5 transition-colors cursor-pointer">
                                <div className="proc-icon w-6 h-6 rounded bg-nexBg2 flex items-center justify-center text-nexText2 text-[10px] font-mono">
                                    {p.name.substring(0,2).toUpperCase()}
                                </div>
                                <div className="proc-name text-nexText flex-1 font-medium">{p.name}</div>
                                <div className="proc-pid text-nexText3 text-[10px] w-12 font-mono">{p.pid}</div>
                                <div className={`proc-cpu w-12 text-right font-semibold ${p.barClass === 'hi' ? 'text-red-400' : p.barClass === 'med' ? 'text-yellow-400' : 'text-nexAccent'}`}>
                                    {p.cpu}
                                </div>
                                <div className="proc-bar w-14 h-1.5 bg-nexBorder rounded-full overflow-hidden">
                                    <div className={`proc-fill h-full rounded-full transition-all duration-500 ${p.barClass === 'hi' ? 'bg-red-500' : p.barClass === 'med' ? 'bg-yellow-500' : 'bg-cyan-400'}`} style={{ width: `${p.bar}%` }} />
                                </div>
                                <div className="proc-mem text-nexText2 w-14 text-right text-[10px] font-mono">{p.mem}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid grid grid-cols-3 gap-4">
                {/* Quick Actions */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                    <div className="panel-header px-5 py-4 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase font-semibold">
                        Quick Actions
                    </div>
                    <div className="quick-grid grid grid-cols-3 gap-3 p-4">
                        {quickActions.map((action, i) => (
                            <button 
                                key={i}
                                className={`quick-btn border border-nexBorder bg-nexBg2 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${action.color}`}
                            >
                                <span className="quick-icon block text-2xl mb-2">{action.icon}</span>
                                <span className="quick-label text-[10px] text-nexText2 tracking-[1px] font-medium">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Disk Usage */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                    <div className="panel-header px-5 py-4 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase font-semibold">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Disk Usage
                        </span>
                    </div>
                    <div className="disk-list p-4">
                        {diskItems.map((d, i) => (
                            <div key={i} className="disk-item mb-4 last:mb-0">
                                <div className="disk-header flex justify-between text-[11px] font-medium mb-2">
                                    <span className="text-nexText2">{d.path}</span>
                                    <span className={`font-bold ${d.pctClass}`}>{d.pct}%</span>
                                </div>
                                <div className="disk-track h-2 bg-nexBorder rounded-full overflow-hidden">
                                    <div className={`disk-fill h-full rounded-full bg-gradient-to-r ${d.fillClass} transition-all duration-500`} style={{ width: `${d.pct}%` }} />
                                </div>
                                <div className="disk-meta text-[10px] text-nexText3 mt-1 flex justify-between">
                                    <span>{d.used}</span>
                                    <span className={d.pct > 90 ? 'text-red-400' : d.pct > 70 ? 'text-yellow-400' : 'text-emerald-400'}>
                                        {d.pct > 90 ? '⚠ Critical' : d.pct > 70 ? '⚡ Warning' : '✓ Healthy'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Log */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-5 py-4 border-b border-nexBorder text-[11px] text-nexText tracking-[2px] uppercase font-semibold">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-nexText">System Log</span>
                        </div>
                        <button className="panel-action bg-transparent border border-nexBorder text-nexText2 text-[10px] px-3 py-1 rounded-lg cursor-pointer font-mono tracking-[1px] transition-all duration-200 hover:border-nexAccent hover:text-nexAccent hover:bg-nexAccent/5">
                            CLEAR
                        </button>
                    </div>
                    <div className="log-list max-h-[220px] overflow-y-auto">
                        {logItems.map((l, i) => (
                            <div key={i} className="log-item flex gap-3 px-5 py-2 text-[10px] font-mono leading-relaxed border-b border-nexBorder/20 hover:bg-nexBg2/50 transition-colors cursor-pointer">
                                <span className="log-time text-nexText3 whitespace-nowrap w-16">{l.time}</span>
                                <span className={`log-msg flex-1 ${l.type === 'err' ? 'text-red-400' : l.type === 'ok' ? 'text-emerald-400' : l.type === 'warn' ? 'text-yellow-400' : 'text-nexText2'}`}>
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
