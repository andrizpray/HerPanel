import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Subdomains({ domain, subdomains, flash }) {
    const [subdomainForm, setSubdomainForm] = useState({ name: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('domains.subdomains.store', domain.id), subdomainForm, {
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
            onSuccess: () => setSubdomainForm({ name: '' }),
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Delete subdomain "${name}"?`)) {
            router.delete(route('domains.subdomains.destroy', [domain.id, id]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <Link href={route('domains.index')} className="text-hpText3 hover:text-white transition-colors">
                        ← Domains
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Subdomains: {domain.domain_name}
                </span>
            }
        >
            <Head title={`Subdomains: ${domain.domain_name}`} />

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Parent Domain</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{domain.domain_name}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Subdomains</div>
                    <div className="text-2xl font-semibold text-purple-400 tabular-nums">{subdomains.length}</div>
                </div>
            </div>

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
                        <span className="text-[13px] text-white font-medium">Subdomains</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {subdomains.length} total
                        </span>
                    </div>
                </div>

                {/* Add Subdomain Form */}
                <div className="p-5 border-b border-hpBorder">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Subdomain Name</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={subdomainForm.name}
                                    onChange={(e) => setSubdomainForm({...subdomainForm, name: e.target.value})}
                                    placeholder="www, api, mail"
                                    className="flex-1 px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white placeholder-hpText3 outline-none focus:border-hpAccent"
                                    required
                                />
                                <span className="text-[12px] text-hpText3">.{domain.domain_name}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-500 text-white rounded-md text-[12px] font-medium hover:bg-purple-400 transition-all disabled:opacity-50"
                        >
                            + Add Subdomain
                        </button>
                    </form>
                </div>

                {/* Subdomains List */}
                {subdomains.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">🌐</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No subdomains yet</div>
                        <div className="text-[12px] text-hpText3">Add your first subdomain using the form above</div>
                    </div>
                ) : (
                    <div className="divide-y divide-hpBorder/50">
                        {subdomains.map((subdomain) => (
                            <div key={subdomain.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-hpAccent/3 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-semibold">
                                        SUB
                                    </span>
                                    <div>
                                        <div className="text-[13px] text-white font-medium">
                                            {subdomain.name}.{domain.domain_name}
                                        </div>
                                        <div className="text-[11px] text-hpText3">
                                            Status: <span className={`font-medium ${subdomain.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {subdomain.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(subdomain.id, `${subdomain.name}.${domain.domain_name}`)}
                                    className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
