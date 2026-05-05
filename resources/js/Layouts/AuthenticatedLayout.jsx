import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const currentRoute = route().current();

    // Live WIB clock
    const [clock, setClock] = useState('');
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            const h = String(wib.getUTCHours()).padStart(2, '0');
            const m = String(wib.getUTCMinutes()).padStart(2, '0');
            const s = String(wib.getUTCSeconds()).padStart(2, '0');
            setClock(`${h}:${m}:${s} WIB`);
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Navigation config
    const navSections = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', route: 'dashboard', icon: '⊞' },
                { name: 'Monitoring', route: 'monitoring.index', icon: '◈' },
                { name: 'Analytics', route: '#', icon: '▦' },
            ]
        },
        {
            label: 'Services',
            items: [
                { name: 'Domains', route: 'domains.index', icon: '◎' },
                { name: 'Databases', route: 'databases.index', icon: '⬡' },
                { name: 'Email', route: '#', icon: '⬢', badge: '3' },
                { name: 'FTP Manager', route: '#', icon: '⬢' },
            ]
        },
        {
            label: 'System',
            items: [
                { name: 'File Manager', route: 'file-manager.index', icon: '⊕' },
                { name: 'Cron Jobs', route: '#', icon: '⊟' },
                { name: 'Firewall', route: '#', icon: '⊗', badge: '1' },
                { name: 'SSL / TLS', route: '#', icon: '⊙' },
                { name: 'Backups', route: '#', icon: '⊘' },
            ]
        },
        {
            label: 'Config',
            items: [
                { name: 'PHP Config', route: '#', icon: '⊛' },
                { name: 'Settings', route: 'profile.edit', icon: '◐' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-nexBg text-nexText font-mono">
            {/* Scanline & grid effects are in CSS */}

            {/* Sidebar */}
            <nav className="sidebar fixed left-0 top-0 bottom-0 w-[240px] bg-nexBg2 border-r border-nexBorder flex flex-col z-[100] overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-nexAccent to-transparent animate-scanH" />

                {/* Logo */}
                <div className="logo-area p-6 border-b border-nexBorder">
                    <div className="logo-badge inline-flex items-center gap-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded px-2.5 py-1.5">
                        <div className="logo-icon w-6 h-6 bg-nexAccent rounded text-nexBg text-xs font-bold flex items-center justify-center font-syne">
                            N
                        </div>
                        <span className="logo-text font-syne text-sm font-extrabold text-white tracking-[2px]">
                            NEXPANEL
                        </span>
                    </div>
                </div>

                {/* Server Status */}
                <div className="server-status p-3.5 border-b border-nexBorder text-[10px] text-nexText3">
                    <div className="status-row flex justify-between mb-1.5">
                        <span>HOST</span>
                        <span className="status-val text-nexAccent3">vps-id-jkt-01</span>
                    </div>
                    <div className="status-row flex justify-between mb-1.5">
                        <span>UPTIME</span>
                        <span className="status-val text-nexAccent3">47d 14h 22m</span>
                    </div>
                    <div className="status-row flex justify-between mb-1.5">
                        <span>LOAD</span>
                        <span className="status-val text-nexWarn">2.84 / 2.91</span>
                    </div>
                    <div className="status-row flex justify-between">
                        <span>IP</span>
                        <span className="status-val text-nexAccent3">43.134.37.14</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="nav flex-1 overflow-y-auto py-3">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="nav-section mb-2">
                            <div className="nav-label text-[9px] tracking-[3px] text-nexText3 px-5 py-1 uppercase">
                                {section.label}
                            </div>
                            {section.items.map((item, i) => {
                                const isActive = currentRoute === item.route;
                                return (
                                    <Link
                                        key={i}
                                        href={item.route === '#' ? '#' : route(item.route)}
                                        className={`nav-item flex items-center gap-2.5 px-5 py-2.5 text-[11px] cursor-pointer transition-all duration-200 border-l-2
                                            ${isActive
                                                ? 'bg-[rgba(0,212,255,0.08)] text-nexAccent border-l-nexAccent'
                                                : 'text-nexText2 hover:bg-[rgba(0,212,255,0.05)] hover:text-nexText hover:border-l-nexBorder2 border-l-transparent'
                                            }`}
                                    >
                                        <span className="icon w-4 text-center text-sm">{item.icon}</span>
                                        {item.name}
                                        {item.badge && (
                                            <span className={`badge ml-auto text-[8px] px-1.5 py-0.5 rounded font-bold
                                                ${item.badge === 'OK' ? 'bg-nexAccent3 text-nexBg' : 'bg-nexDanger text-white'}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer p-3.5 border-t border-nexBorder text-[10px] text-nexText3">
                    <div className="user-row flex items-center gap-2.5 cursor-pointer">
                        <div className="avatar w-7 h-7 rounded bg-gradient-to-br from-nexAccent2 to-nexAccent flex items-center justify-center text-[11px] font-bold text-nexBg font-syne">
                            {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}
                        </div>
                        <div className="user-info flex-1">
                            <div className="user-name text-[11px] text-nexText font-medium">{user.name}</div>
                            <div className="user-role text-[9px] text-nexText3 mt-0.5 uppercase tracking-wider">{user.role}</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Topbar */}
            <header className="topbar fixed left-[240px] top-0 right-0 h-[52px] bg-nexBg2 border-b border-nexBorder flex items-center px-7 gap-4 z-[90]">
                <div className="breadcrumb text-[11px] text-nexText3 flex items-center gap-1.5">
                    NEXPANEL / <span className="text-nexAccent">Dashboard</span>
                </div>
                <div className="topbar-right ml-auto flex items-center gap-3">
                    <div className="clock text-[11px] text-nexAccent border border-nexBorder px-2.5 py-1 rounded bg-[rgba(0,212,255,0.04)] tracking-[1px]">
                        {clock}
                    </div>
                    <button className="notif-btn w-8 h-8 rounded border border-nexBorder bg-transparent text-nexText2 cursor-pointer flex items-center justify-center text-sm transition-all hover:border-nexAccent hover:text-nexAccent relative">
                        🔔
                        <span className="notif-dot absolute top-1 right-1 w-1.5 h-1.5 bg-nexDanger rounded-full"></span>
                    </button>
                    <button className="notif-btn w-8 h-8 rounded border border-nexBorder bg-transparent text-nexText2 cursor-pointer flex items-center justify-center text-sm transition-all hover:border-nexAccent hover:text-nexAccent">
                        ⚙
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main ml-[240px] pt-[52px] min-h-screen relative z-10">
                <div className="content p-7">
                    {header && (
                        <div className="page-header mb-7">
                            <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px]">
                                {header}
                            </h1>
                            <p className="page-sub text-[10px] text-nexText3 mt-1 tracking-[1px]">
                                // LAST SYNC: <span id="sync-time">05 MAY 2026 — 14:32:08 WIB</span>
                            </p>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
