import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [mobileOpen, setMobileOpen] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('quick-actions.packages'));
            const data = await response.json();
            if (data.success) {
                setPackages(data.packages);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const installPackage = async (name) => {
        if (!confirm(`Install ${name}?`)) return;
        setInstalling(name);
        try {
            const response = await fetch(route('quick-actions.packages.install'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ package: name }),
            });
            const data = await response.json();
            setMessage({ type: data.success ? 'success' : 'error', text: data.message });
            if (data.success) {
                fetchPackages();
                setMobileOpen(null);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setInstalling(null);
        }
    };

    const toggleMobile = (pkgName) => {
        setMobileOpen(mobileOpen === pkgName ? null : pkgName);
    };

    const filteredPackages = activeTab === 'all' 
        ? packages 
        : packages.filter(p => p.category.toLowerCase() === activeTab);

    const categories = ['all', 'web server', 'php', 'database', 'cache', 'runtime', 'mail', 'ftp', 'security', 'tools'];

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Package Management
                </span>
            }
        >
            <Head title="Package Management" />

            <div className="mb-6 p-5 rounded-lg bg-hpBg2 border border-hpBorder">
                <h2 className="text-base font-semibold text-white mb-2">Software Package Manager</h2>
                <p className="text-[13px] text-hpText2">Install, manage, dan pantau software server</p>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg border text-[13px] ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Category Tabs - Horizontal Scroll on Mobile */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-md text-[12px] font-medium transition-all whitespace-nowrap ${
                            activeTab === cat
                                ? 'bg-hpAccent text-white'
                                : 'bg-hpBg border border-hpBorder text-hpText2 hover:border-hpAccent hover:text-hpAccent2'
                        }`}
                    >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="bg-hpBg/50">
                            <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Package</th>
                            <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Category</th>
                            <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Version</th>
                            <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Status</th>
                            <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-center text-hpText3">Loading packages...</td>
                            </tr>
                        ) : filteredPackages.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-center text-hpText3">No packages found</td>
                            </tr>
                        ) : (
                            filteredPackages.map((pkg, i) => (
                                <tr key={i} className="hover:bg-hpAccent/3 transition-colors border-b border-hpBorder/50 last:border-0">
                                    <td className="px-5 py-3.5 text-white font-medium">{pkg.name}</td>
                                    <td className="px-5 py-3.5 text-hpText2">{pkg.category}</td>
                                    <td className="px-5 py-3.5 font-mono text-hpText3">{pkg.version || '-'}</td>
                                    <td className="px-5 py-3.5">
                                        {pkg.status === 'running' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Running
                                            </span>
                                        ) : pkg.installed ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                Installed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-hpText3/10 text-hpText3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-hpText3" />
                                                Not Installed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {pkg.installed ? (
                                            <span className="text-[12px] text-hpText3">Installed</span>
                                        ) : (
                                            <button
                                                onClick={() => installPackage(pkg.name)}
                                                disabled={installing === pkg.name}
                                                className="px-3 py-1 rounded-md bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] hover:bg-hpAccent/20 transition-colors disabled:opacity-50"
                                            >
                                                {installing === pkg.name ? 'Installing...' : 'Install'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="p-5 text-center text-hpText3">Loading packages...</div>
                ) : filteredPackages.length === 0 ? (
                    <div className="p-5 text-center text-hpText3">No packages found</div>
                ) : (
                    filteredPackages.map((pkg, i) => (
                        <div key={i} className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                            <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleMobile(pkg.name)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-medium text-white truncate">{pkg.name}</div>
                                        <div className="text-[11px] text-hpText3">{pkg.category}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pkg.status === 'running' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                Running
                                            </span>
                                        ) : pkg.installed ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">
                                                Installed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-hpText3/10 text-hpText3">
                                                -
                                            </span>
                                        )}
                                        <span className={`text-hpText3 transition-transform ${mobileOpen === pkg.name ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile Action Panel */}
                            {mobileOpen === pkg.name && (
                                <div className="px-4 pb-4 border-t border-hpBorder/50">
                                    <div className="pt-3 space-y-2">
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-hpText3">Version:</span>
                                            <span className="font-mono text-white">{pkg.version || '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-hpText3">Status:</span>
                                            <span className={pkg.status === 'running' ? 'text-emerald-400' : 'text-hpText2'}>
                                                {pkg.status}
                                            </span>
                                        </div>
                                        <div className="pt-2">
                                            {pkg.installed ? (
                                                <span className="text-[12px] text-hpText3">Already installed</span>
                                            ) : (
                                                <button
                                                    onClick={() => installPackage(pkg.name)}
                                                    disabled={installing === pkg.name}
                                                    className="w-full px-3 py-2 rounded-md bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] hover:bg-hpAccent/20 transition-colors disabled:opacity-50"
                                                >
                                                    {installing === pkg.name ? 'Installing...' : 'Install'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}