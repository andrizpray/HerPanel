import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const currentRoute = route().current();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);

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

    // Get page title from route
    const getPageTitle = () => {
        if (!currentRoute) return 'Dashboard';
        const titles = {
            'dashboard': 'Dashboard',
            'monitoring.index': 'Server Monitoring',
            'domains.index': 'Domain Management',
            'domains.create': 'Add New Domain',
            'databases.index': 'Database Management',
            'databases.create': 'Create Database',
            'file-manager.index': 'File Manager',
            'profile.edit': 'Settings',
        };
        return titles[currentRoute] || 'Dashboard';
    };

    // Navigation config
    const navSections = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', route: 'dashboard', icon: '⊞', color: 'text-cyan-400' },
                { name: 'Monitoring', route: 'monitoring.index', icon: '◈', color: 'text-emerald-400' },
            ]
        },
        {
            label: 'Services',
            items: [
                { name: 'Domains', route: 'domains.index', icon: '◎', color: 'text-blue-400' },
                { name: 'Databases', route: 'databases.index', icon: '⬡', color: 'text-purple-400' },
                { name: 'File Manager', route: 'file-manager.index', icon: '⊕', color: 'text-orange-400' },
            ]
        },
        {
            label: 'Settings',
            items: [
                { name: 'Settings', route: 'profile.edit', icon: '◐', color: 'text-gray-400' },
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
                <div className="server-status p-3.5 border-b border-nexBorder text-[11px] text-nexText2 font-medium">
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
                            <div className="nav-label text-[10px] tracking-[3px] text-nexText2/60 font-semibold px-5 py-1 uppercase">
                                {section.label}
                            </div>
                            {section.items.map((item, i) => {
                                const isActive = currentRoute === item.route;
                                return (
                                    <Link
                                        key={i}
                                        href={route(item.route)}
                                        onMouseEnter={() => setHoveredItem(item.route)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`nav-item flex items-center gap-2.5 px-5 py-2.5 text-[11px] cursor-pointer transition-all duration-200 border-l-2 font-medium relative overflow-hidden
                                            ${isActive
                                                ? 'bg-gradient-to-r from-[rgba(0,212,255,0.12)] to-transparent text-nexAccent border-l-nexAccent'
                                                : hoveredItem === item.route
                                                    ? 'bg-[rgba(0,212,255,0.06)] text-white border-l-nexBorder2'
                                                    : 'text-nexText2 border-l-transparent hover:text-nexText'
                                            }`}
                                    >
                                        {/* Hover glow effect */}
                                        {hoveredItem === item.route && !isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-nexAccent/5 to-transparent pointer-events-none" />
                                        )}
                                        <span className={`icon w-5 h-5 rounded flex items-center justify-center text-sm ${item.color || 'text-nexText2'}`}>
                                            {item.icon}
                                        </span>
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-nexAccent animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer p-3.5 border-t border-nexBorder text-[11px] text-nexText2">
                    <div className="user-row flex items-center gap-2.5 mb-3">
                        <div className="avatar w-8 h-8 rounded-lg bg-gradient-to-br from-nexAccent2 to-nexAccent flex items-center justify-center text-[12px] font-bold text-nexBg font-syne shadow-lg shadow-nexAccent/20">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info flex-1 min-w-0">
                            <div className="user-name text-[11px] text-white font-semibold truncate">{user.name}</div>
                            <div className="user-role text-[10px] text-nexText2 mt-0.5 uppercase tracking-wider">{user.role}</div>
                        </div>
                    </div>
                    <form method="POST" action={route('logout')}>
                        <input type="hidden" name="_token" value={usePage().props.csrf_token} />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-nexPanel border border-nexBorder/50 text-[10px] text-nexText2 hover:text-nexDanger hover:border-nexDanger/50 transition-all duration-200 tracking-[1px] uppercase font-semibold hover:bg-nexDanger/5">
                            <span>↩</span> Logout
                        </button>
                    </form>
                </div>
            </nav>

            {/* Topbar */}
            <header className="topbar fixed left-[240px] top-0 right-0 h-[52px] bg-nexBg2/80 backdrop-blur-md border-b border-nexBorder flex items-center px-7 gap-4 z-[90]">
                <div className="breadcrumb text-[12px] text-nexText2 flex items-center gap-2 font-medium">
                    <span className="text-nexText3/60">NEXPANEL</span>
                    <span className="text-nexText3/40">/</span>
                    <span className="text-nexAccent font-semibold">{getPageTitle()}</span>
                </div>
                <div className="topbar-right ml-auto flex items-center gap-3">
                    <div className="clock flex items-center gap-2 text-[12px] text-nexAccent border border-nexBorder/50 px-3 py-1.5 rounded-lg bg-nexPanel/50 tracking-[1px] font-semibold backdrop-blur-sm">
                        <span className="text-nexText3/60">🕐</span>
                        {clock}
                    </div>
                    <button className="w-9 h-9 rounded-lg border border-nexBorder/50 bg-nexPanel/50 text-nexText2 cursor-pointer flex items-center justify-center text-sm transition-all duration-200 hover:border-nexAccent hover:text-nexAccent backdrop-blur-sm">
                        🔔
                    </button>
                    <button className="w-9 h-9 rounded-lg border border-nexBorder/50 bg-nexPanel/50 text-nexText2 cursor-pointer flex items-center justify-center text-sm transition-all duration-200 hover:border-nexAccent hover:text-nexAccent backdrop-blur-sm">
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
