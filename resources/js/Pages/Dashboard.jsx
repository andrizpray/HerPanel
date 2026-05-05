import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    // Static data for now (replace with real API later)
    const stats = [
        { label: 'CPU Usage', value: '62', unit: '%', icon: '⚡', bar: 62, sub: '▲ 8% vs last hour · 8 cores', subType: 'up' },
        { label: 'RAM Usage', value: '11.4', unit: 'GB', icon: '◉', bar: 71, sub: '▲ 71% of 16 GB', subType: 'dn', barClass: 'warn' },
        { label: 'Disk I/O', value: '94', unit: '%', icon: '⬡', bar: 94, sub: '⚠ CRITICAL · /dev/sda1', subType: 'dn', barClass: 'danger', alert: true },
        { label: 'Bandwidth', value: '2.1', unit: 'TB', icon: '⬢', bar: 42, sub: '▲ 42% of 5 TB quota', subType: 'up' },
    ];

    const domains = [
        { domain: 'example.id', ssl: '✓ Let\'s', expiry: '2026-11-12', status: 'LIVE', statusClass: 'live' },
        { domain: 'api.example.id', ssl: '✓ Let\'s', expiry: '2026-11-12', status: 'LIVE', statusClass: 'live' },
        { domain: 'shop.example.id', ssl: '✓ Wildcard', expiry: '2026-05-30', status: 'EXPIRING', statusClass: 'exp' },
        { domain: 'dev.example.id', ssl: '✗ None', expiry: '—', status: 'OFFLINE', statusClass: 'off' },
        { domain: 'mail.example.id', ssl: '✓ Let\'s', expiry: '2026-12-01', status: 'LIVE', statusClass: 'live' },
    ];

    const processes = [
        { name: 'nginx', pid: '1024', cpu: '18.4%', mem: '124 MB', bar: 18 },
        { name: 'php-fpm8.2', pid: '2048', cpu: '31.2%', mem: '512 MB', bar: 31, barClass: 'med' },
        { name: 'mysqld', pid: '3012', cpu: '22.7%', mem: '2.1 GB', bar: 23, barClass: 'med' },
        { name: 'redis-server', pid: '3501', cpu: '4.1%', mem: '88 MB', bar: 4 },
        { name: 'node', pid: '4820', cpu: '67.8%', mem: '340 MB', bar: 68, barClass: 'hi' },
    ];

    const diskItems = [
        { path: '/dev/sda1 (root)', pct: 94, pctClass: 'danger', fillClass: 'danger', used: '188 GB / 200 GB' },
        { path: '/dev/sdb1 (data)', pct: 67, pctClass: 'warn', fillClass: 'warn', used: '335 GB / 500 GB' },
        { path: '/dev/sdc1 (backup)', pct: 31, pctClass: '', fillClass: '', used: '310 GB / 1 TB' },
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

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header mb-7">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px]">
                        SERVER <span className="text-nexAccent">OVERVIEW</span> <span className="cursor-blink"></span>
                    </h1>
                    <p className="page-sub text-[10px] text-nexText3 mt-1 tracking-[1px]">
                        // LAST SYNC: <span id="sync-time">05 MAY 2026 — 14:32:08 WIB</span>
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="stats-grid grid grid-cols-4 gap-4 mb-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`stat-card bg-nexPanel border border-nexBorder rounded-lg p-4.5 relative overflow-hidden transition-all duration-300 hover:border-nexBorder2 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:-translate-y-0.5 ${stat.alert ? 'border-[rgba(255,58,58,0.3)]' : ''}`}
                        style={{ animation: `fadeUp 0.5s ease both ${idx * 0.05}s` }}
                    >
                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-nexAccent opacity-0 transition-opacity duration-300 hover:opacity-50 ${stat.alert ? 'bg-nexDanger opacity-40' : ''}`}></div>

                        <div className="stat-label text-[9px] tracking-[2px] text-nexText3 uppercase mb-3">
                            {stat.label}
                        </div>
                        <div className="stat-value font-syne text-3xl font-extrabold text-white leading-none">
                            {stat.value}<span className="text-sm font-normal text-nexText2 ml-1">{stat.unit}</span>
                        </div>
                        <div className={`stat-bar mt-2.5 h-[3px] bg-nexBorder rounded-full overflow-hidden`}>
                            <div
                                className={`stat-bar-fill h-full rounded-full bg-gradient-to-r from-nexAccent2 to-nexAccent transition-all duration-1000 ${stat.barClass === 'warn' ? 'from-[#cc4a00] to-nexWarn' : stat.barClass === 'danger' ? 'from-[#990000] to-nexDanger' : ''}`}
                                style={{ width: `${stat.bar}%` }}
                            ></div>
                        </div>
                        <div className={`stat-sub text-[9px] text-nexText3 mt-2 ${stat.subType === 'up' ? 'text-nexAccent3' : 'text-nexDanger'}`}>
                            {stat.sub}
                        </div>

                        {/* Icon */}
                        <div className="stat-icon absolute right-4 top-4 text-2xl opacity-15">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="main-grid grid grid-cols-2 gap-4 mb-4">
                {/* Domains Panel */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-lg overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-4.5 py-3.5 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase">
                        <div><span className="dot inline-block w-1.5 h-1.5 bg-nexAccent3 rounded-full mr-2 animate-pulse"></span>Active Domains</div>
                        <button className="panel-action bg-transparent border border-nexBorder text-nexText3 text-[9px] px-2 py-0.5 rounded cursor-pointer font-mono tracking-[1px] transition-all hover:border-nexAccent hover:text-nexAccent">
                            + ADD
                        </button>
                    </div>
                    <table className="domain-table w-full text-[11px]">
                        <thead>
                            <tr>
                                <th className="text-[9px] tracking-[1px] text-nexText3 uppercase p-2.5 text-left border-b border-nexBorder">Domain</th>
                                <th className="text-[9px] tracking-[1px] text-nexText3 uppercase p-2.5 text-left border-b border-nexBorder">SSL</th>
                                <th className="text-[9px] tracking-[1px] text-nexText3 uppercase p-2.5 text-left border-b border-nexBorder">Expiry</th>
                                <th className="text-[9px] tracking-[1px] text-nexText3 uppercase p-2.5 text-left border-b border-nexBorder">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((d, i) => (
                                <tr key={i} className="hover:bg-[rgba(0,212,255,0.03)]">
                                    <td className="p-2.5 border-b border-[rgba(30,45,61,0.5)] text-nexText">{d.domain}</td>
                                    <td className="p-2.5 border-b border-[rgba(30,45,61,0.5)] text-nexText">{d.ssl}</td>
                                    <td className="p-2.5 border-b border-[rgba(30,45,61,0.5)] text-nexText">{d.expiry}</td>
                                    <td className="p-2.5 border-b border-[rgba(30,45,61,0.5)]">
                                        <span className={`status-badge inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-[1px] ${d.statusClass === 'live' ? 'bg-[rgba(0,255,136,0.1)] text-nexAccent3 border border-[rgba(0,255,136,0.2)]' : d.statusClass === 'exp' ? 'bg-[rgba(255,107,53,0.1)] text-nexWarn border border-[rgba(255,107,53,0.2)]' : 'bg-[rgba(255,58,58,0.1)] text-nexDanger border border-[rgba(255,58,58,0.2)]'}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Processes Panel */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-lg overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-4.5 py-3.5 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase">
                        <div><span className="dot inline-block w-1.5 h-1.5 bg-nexAccent3 rounded-full mr-2 animate-pulse"></span>Top Processes</div>
                        <button className="panel-action bg-transparent border border-nexBorder text-nexText3 text-[9px] px-2 py-0.5 rounded cursor-pointer font-mono tracking-[1px] transition-all hover:border-nexAccent hover:text-nexAccent">
                            KILL
                        </button>
                    </div>
                    <div className="process-list p-0">
                        {processes.map((p, i) => (
                            <div key={i} className="process-item flex items-center gap-3 px-4.5 py-2.5 border-b border-[rgba(30,45,61,0.4)] text-[10px] hover:bg-[rgba(0,212,255,0.03)]">
                                <div className="proc-name text-nexText flex-1">{p.name}</div>
                                <div className="proc-pid text-nexText3 w-12">{p.pid}</div>
                                <div className="proc-cpu text-nexAccent w-12 text-right">{p.cpu}</div>
                                <div className="proc-bar w-15 h-[3px] bg-nexBorder rounded-full overflow-hidden">
                                    <div className={`proc-fill h-full rounded-full bg-nexAccent ${p.barClass === 'med' ? 'bg-nexWarn' : p.barClass === 'hi' ? 'bg-nexDanger' : ''}`} style={{ width: `${p.bar}%` }}></div>
                                </div>
                                <div className="proc-mem text-nexText2 w-12 text-right">{p.mem}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid grid grid-cols-3 gap-4">
                {/* Quick Actions */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-lg overflow-hidden">
                    <div className="panel-header px-4.5 py-3.5 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase">
                        Quick Actions
                    </div>
                    <div className="quick-grid grid grid-cols-3 gap-2 p-4">
                        {['🔄', '🛡', '💾', '📦', '🔑', '📊'].map((icon, i) => {
                            const labels = ['RESTART', 'FIREWALL', 'BACKUP', 'PACKAGES', 'SSH KEYS', 'REPORTS'];
                            return (
                                <div key={i} className="quick-btn border border-nexBorder bg-nexBg2 rounded p-3 text-center cursor-pointer transition-all duration-200 hover:border-nexAccent hover:bg-[rgba(0,212,255,0.06)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,212,255,0.1)]">
                                    <span className="quick-icon block text-xl mb-1.5">{icon}</span>
                                    <span className="quick-label text-[9px] text-nexText2 tracking-[1px]">{labels[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Disk Usage */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-lg overflow-hidden">
                    <div className="panel-header px-4.5 py-3.5 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase">
                        <span className="dot inline-block w-1.5 h-1.5 bg-nexAccent3 rounded-full mr-2 animate-pulse"></span>Disk Usage
                    </div>
                    <div className="disk-list p-4.5">
                        {diskItems.map((d, i) => (
                            <div key={i} className="disk-item mb-3.5 last:mb-0">
                                <div className="disk-header flex justify-between text-[10px] mb-1.5">
                                    <span className="disk-path text-nexText2">{d.path}</span>
                                    <span className={`disk-pct text-nexAccent ${d.pctClass}`}>{d.pct}%</span>
                                </div>
                                <div className="disk-track h-[4px] bg-nexBorder rounded-full overflow-hidden">
                                    <div className={`disk-fill h-full rounded-full bg-gradient-to-r from-nexAccent2 to-nexAccent ${d.fillClass}`} style={{ width: `${d.pct}%` }}></div>
                                </div>
                                <div className="disk-meta text-[9px] text-nexText3 mt-0.5">{d.used}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Log */}
                <div className="panel bg-nexPanel border border-nexBorder rounded-lg overflow-hidden">
                    <div className="panel-header flex items-center justify-between px-4.5 py-3.5 border-b border-nexBorder text-[10px] text-nexText2 tracking-[2px] uppercase">
                        <div><span className="dot inline-block w-1.5 h-1.5 bg-nexAccent3 rounded-full mr-2 animate-pulse"></span>System Log</div>
                        <button className="panel-action bg-transparent border border-nexBorder text-nexText3 text-[9px] px-2 py-0.5 rounded cursor-pointer font-mono tracking-[1px] transition-all hover:border-nexAccent hover:text-nexAccent">
                            CLEAR
                        </button>
                    </div>
                    <div className="log-list p-0 max-h-[200px] overflow-y-auto">
                        {logItems.map((l, i) => (
                            <div key={i} className="log-item flex gap-2.5 px-4.5 py-1.5 text-[9px] font-mono leading-[1.5] border-b border-[rgba(30,45,61,0.3)]">
                                <span className="log-time text-nexText3 whitespace-nowrap">{l.time}</span>
                                <span className={`log-msg ${l.type === 'err' ? 'text-nexDanger' : l.type === 'ok' ? 'text-nexAccent3' : l.type === 'warn' ? 'text-nexWarn' : 'text-nexText2'}`}>{l.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
