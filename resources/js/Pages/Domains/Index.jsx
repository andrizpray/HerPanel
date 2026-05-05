import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ domains, flash }) {
    const [mounted, setMounted] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => { setMounted(true); }, []);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this domain?\n\nThis action cannot be undone.')) {
            router.delete(route('domains.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Domain Management
                </span>
            }
        >
            <Head title="Domains" />

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Total Domains</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{domains.length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Active</div>
                    <div className="text-2xl font-semibold text-emerald-400 tabular-nums">{domains.filter(d => d.status === 'active').length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Inactive</div>
                    <div className="text-2xl font-semibold text-red-400 tabular-nums">{domains.filter(d => d.status !== 'active').length}</div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                        ✗ {flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-white font-medium">Your Domains</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {domains.length} total
                        </span>
                    </div>
                    <Link
                        href={route('domains.create')}
                        className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors"
                    >
                        + Add Domain
                    </Link>
                </div>

                {domains.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">◎</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No domains yet</div>
                        <div className="text-[12px] text-hpText3 mb-4">Get started by adding your first domain</div>
                        <Link
                            href={route('domains.create')}
                            className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                        >
                            + Add Your First Domain
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Domain Name</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Registered</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((domain) => (
                                <tr
                                    key={domain.id}
                                    className={`transition-colors ${hoveredRow === domain.id ? 'bg-hpAccent/3' : ''}`}
                                    onMouseEnter={() => setHoveredRow(domain.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-hpBg border border-hpBorder flex items-center justify-center text-hpAccent2 text-[10px] font-semibold">
                                                {domain.domain_name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="text-[13px] text-white font-medium">{domain.domain_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium
                                            ${domain.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-red-500/10 text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${domain.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {domain.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-[12px] text-hpText2">
                                        {new Date(domain.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-3 py-1.5 rounded-md bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:border-hpAccent hover:text-hpAccent2 transition-colors">
                                                DNS
                                            </button>
                                            <button className="px-3 py-1.5 rounded-md bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:border-hpAccent hover:text-hpAccent2 transition-colors">
                                                SSL
                                            </button>
                                            <button
                                                onClick={() => handleDelete(domain.id)}
                                                className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                Delete
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
