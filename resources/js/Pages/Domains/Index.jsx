import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ domains, flash }) {
    const [mounted, setMounted] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleDelete = (id) => {
        if (confirm('⚠️ Are you sure you want to delete this domain?\n\nThis action cannot be undone.')) {
            router.delete(route('domains.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px] flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        DOMAIN <span className="text-nexAccent">MANAGEMENT</span>
                    </h1>
                    <p className="page-sub text-[11px] text-nexText2 font-medium mt-2 tracking-[1px]">
                        // {currentTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }).replace(/\//g, ' — ')} WIB
                    </p>
                </div>
            }
        >
            <Head title="Domains" />

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-nexPanel border border-nexBorder rounded-xl p-4">
                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Total Domains</div>
                    <div className="text-2xl font-syne font-bold text-white">{domains.length}</div>
                </div>
                <div className="bg-nexPanel border border-nexBorder rounded-xl p-4">
                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Active</div>
                    <div className="text-2xl font-syne font-bold text-emerald-400">{domains.filter(d => d.status === 'active').length}</div>
                </div>
                <div className="bg-nexPanel border border-nexBorder rounded-xl p-4">
                    <div className="text-[10px] text-nexText3 uppercase tracking-wider mb-1">Inactive</div>
                    <div className="text-2xl font-syne font-bold text-red-400">{domains.filter(d => d.status !== 'active').length}</div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium">
                        ✗ {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-nexBorder">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-nexText2 tracking-[2px] uppercase font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            Your Domains
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-nexBg2 text-nexText2 border border-nexBorder">
                            {domains.length} total
                        </span>
                    </div>
                    <Link
                        href={route('domains.create')}
                        className="flex items-center gap-2 bg-nexAccent/10 border border-nexAccent/30 text-nexAccent text-[10px] px-4 py-2 rounded-lg cursor-pointer tracking-[1px] font-semibold transition-all duration-200 hover:bg-nexAccent/20 hover:shadow-lg hover:shadow-nexAccent/10"
                    >
                        <span className="text-base">+</span> ADD DOMAIN
                    </Link>
                </div>

                {/* Table */}
                {domains.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4 opacity-30">◎</div>
                        <div className="text-[13px] text-nexText2 font-medium mb-2">No domains yet</div>
                        <div className="text-[11px] text-nexText3 mb-4">Get started by adding your first domain</div>
                        <Link
                            href={route('domains.create')}
                            className="inline-flex items-center gap-2 bg-nexAccent text-nexBg text-[11px] px-4 py-2 rounded-lg font-semibold transition-all hover:bg-nexAccent/90"
                        >
                            + Add Your First Domain
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-nexBg2/50">
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder">Domain Name</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder">Status</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder">Registered</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-right font-semibold border-b border-nexBorder">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((domain, idx) => (
                                <tr 
                                    key={domain.id} 
                                    className={`transition-all duration-200 cursor-pointer ${hoveredRow === domain.id ? 'bg-nexAccent/5' : ''}`}
                                    onMouseEnter={() => setHoveredRow(domain.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-4 border-b border-nexBorder/30">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-nexBg2 border border-nexBorder flex items-center justify-center text-nexAccent text-[10px] font-bold">
                                                {domain.domain_name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="text-[12px] text-white font-medium">{domain.domain_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b border-nexBorder/30">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[1px]
                                            ${domain.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${domain.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'} ${domain.status === 'active' ? 'animate-pulse' : ''}`} />
                                            {domain.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-nexBorder/30 text-[11px] text-nexText2">
                                        {new Date(domain.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-4 border-b border-nexBorder/30 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-3 py-1.5 rounded-lg bg-nexBg2 border border-nexBorder text-[10px] text-nexText2 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-200">
                                                DNS
                                            </button>
                                            <button className="px-3 py-1.5 rounded-lg bg-nexBg2 border border-nexBorder text-[10px] text-nexText2 hover:border-red-500/50 hover:text-red-400 transition-all duration-200">
                                                SSL
                                            </button>
                                            <button
                                                onClick={() => handleDelete(domain.id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-200"
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
