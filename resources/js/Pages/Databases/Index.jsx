import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ databases, flash }) {
    const [mounted, setMounted] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => { setMounted(true); }, []);

    const handleDelete = (id, dbName) => {
        if (confirm(`Delete database "${dbName}"?\n\nThis action cannot be undone and all data will be permanently lost.`)) {
            router.delete(route('databases.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Database Management
                </span>
            }
        >
            <Head title="Databases" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Total Databases</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{databases.length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Active</div>
                    <div className="text-2xl font-semibold text-emerald-400 tabular-nums">{databases.filter(d => d.status === 'active').length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Storage Used</div>
                    <div className="text-2xl font-semibold text-hpAccent2 tabular-nums">~{databases.length * 50} MB</div>
                </div>
            </div>

            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-white font-medium">MySQL Databases</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {databases.length} total
                        </span>
                    </div>
                    <Link
                        href={route('databases.create')}
                        className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-purple-500/20 transition-colors"
                    >
                        + Create Database
                    </Link>
                </div>

                {databases.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">⬡</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No databases yet</div>
                        <div className="text-[12px] text-hpText3 mb-4">Create your first database to get started</div>
                        <Link
                            href={route('databases.create')}
                            className="inline-flex items-center gap-2 bg-purple-500 text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-purple-400 transition-colors"
                        >
                            + Create Your First Database
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Database Name</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Username</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Created</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {databases.map((db) => (
                                <tr
                                    key={db.id}
                                    className={`transition-colors ${hoveredRow === db.id ? 'bg-purple-500/3' : ''}`}
                                    onMouseEnter={() => setHoveredRow(db.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-semibold">DB</span>
                                            <span className="text-[13px] text-white font-mono font-medium">{db.db_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-[12px] text-hpText2 font-mono">{db.db_user}</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium
                                            ${db.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${db.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {db.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-[12px] text-hpText2">
                                        {new Date(db.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-3 py-1.5 rounded-md bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:border-hpAccent hover:text-hpAccent2 transition-colors">
                                                PHPMyAdmin
                                            </button>
                                            <button
                                                onClick={() => handleDelete(db.id, db.db_name)}
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
