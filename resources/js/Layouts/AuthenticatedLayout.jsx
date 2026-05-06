import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const currentRoute = route().current();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

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

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on mobile after clicking a link
    const handleNavClick = () => {
        if (isMobile) setSidebarOpen(false);
    };

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
            'emails.index': 'Email Accounts',
            'emails.create': 'Create Email Account',
            'emails.edit': 'Change Email Password',
            'file-manager.index': 'File Manager',
            'backups.index': 'Backups',
            'profile.edit': 'Settings',
        };
        return titles[currentRoute] || 'Dashboard';
    };

    // Navigation config
    const navSections = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', route: 'dashboard', icon: '⊞', color: 'text-hpAccent2' },
                { name: 'Monitoring', route: 'monitoring.index', icon: '◈', color: 'text-emerald-400' },
            ]
        },
        {
            label: 'Services',
            items: [
                { name: 'Domains', route: 'domains.index', icon: '◎', color: 'text-blue-400' },
                { name: 'Databases', route: 'databases.index', icon: '⬡', color: 'text-purple-400' },
                { name: 'Emails', route: 'emails.index', icon: '✉', color: 'text-sky-400' },
                { name: 'File Manager', route: 'file-manager.index', icon: '⊕', color: 'text-amber-400' },
                { name: 'Backups', route: 'backups.index', icon: '💾', color: 'text-indigo-400' },
            ]
        },
        {
            label: 'System',
            items: [
                { name: 'Settings', route: 'profile.edit', icon: '◐', color: 'text-slate-400' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-hpBg text-hpText font-sans">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[99]"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`
                fixed left-0 top-0 bottom-0 w-[240px] bg-hpBg2 border-r border-hpBorder flex flex-col z-[100]
                transition-transform duration-300
                ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-4 border-b border-hpBorder">
                    <div className="inline-flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-hpAccent rounded-lg text-white text-sm font-bold flex items-center justify-center">
                            H
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-white tracking-wide">
                                HerPanel
                            </span>
                            <div className="text-[10px] text-hpText3 mt-0.5">Cloud Hosting Panel</div>
                        </div>
                    </div>
                </div>

                {/* Server Status */}
                <div className="p-4 border-b border-hpBorder text-[11px] text-hpText2">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-hpText3">Host</span>
                        <span className="text-hpText font-medium">vps-id-jkt-01</span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                        <span className="text-hpText3">IP</span>
                        <span className="text-hpText font-mono text-[10px]">43.134.37.14</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-hpText3">Status</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Online
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-2">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="mb-1">
                            <div className="text-[10px] tracking-[0.08em] text-hpText3 font-medium px-4 py-2 uppercase">
                                {section.label}
                            </div>
                            {section.items.map((item, i) => {
                                const isActive = currentRoute === item.route;
                                return (
                                    <Link
                                        key={i}
                                        href={route(item.route)}
                                        onClick={handleNavClick}
                                        onMouseEnter={() => setHoveredItem(item.route)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all duration-150 border-l-2 font-medium relative
                                            ${isActive
                                                ? 'bg-hpAccent/10 text-hpAccent2 border-l-hpAccent'
                                                : hoveredItem === item.route
                                                    ? 'bg-hpBg3/50 text-white border-l-transparent'
                                                    : 'text-hpText2 border-l-transparent hover:text-hpText'
                                            }`}
                                    >
                                        <span className={`w-5 h-5 flex items-center justify-center text-sm ${isActive ? item.color : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-hpAccent" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-hpBorder">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-hpAccent/20 flex items-center justify-center text-[12px] font-semibold text-hpAccent2">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-white font-medium truncate">{user.name}</div>
                            <div className="text-[10px] text-hpText3 capitalize">{user.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:text-hpDanger hover:border-red-500/30 transition-all duration-150 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Topbar */}
            <header className={`
                fixed top-0 right-0 h-[52px] bg-hpBg2/80 backdrop-blur-md border-b border-hpBorder flex items-center px-4 md:px-6 gap-4 z-[90]
                ${isMobile ? 'left-0' : 'left-[240px]'}
            `}>
                {/* Mobile menu button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden w-8 h-8 rounded-lg border border-hpBorder bg-hpBg/50 text-hpText2 flex items-center justify-center text-sm hover:border-hpAccent hover:text-hpAccent transition-colors"
                >
                    {sidebarOpen ? '×' : '☰'}
                </button>

                <div className="text-[13px] text-hpText2 flex items-center gap-2 truncate">
                    <span className="text-hpText3/60 hidden sm:inline">HerPanel</span>
                    <span className="text-hpText3/40 hidden sm:inline">/</span>
                    <span className="text-hpText font-semibold truncate">{getPageTitle()}</span>
                </div>
                <div className="ml-auto flex items-center gap-2 md:gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-[12px] text-hpText2 border border-hpBorder px-3 py-1.5 rounded-lg bg-hpBg/50 tabular-nums">
                        {clock}
                    </div>
                    <button className="w-8 h-8 rounded-lg border border-hpBorder bg-hpBg/50 text-hpText2 flex items-center justify-center text-sm hover:border-hpAccent hover:text-hpAccent transition-colors">
                        🔔
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={`min-h-screen ${isMobile ? 'ml-0' : 'ml-[240px]'} pt-[52px]`}>
                <div className="p-4 md:p-6">
                    {header && (
                        <div className="mb-4 md:mb-6">
                            <h1 className="text-lg md:text-xl font-semibold text-white truncate">
                                {header}
                            </h1>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
