import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ rules, ufw_status }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        type: 'deny',
        source: '',
        port: '',
        protocol: 'all',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/firewall', form, {
            onSuccess: () => {
                setForm({ type: 'deny', source: '', port: '', protocol: 'all', description: '' });
                setShowForm(false);
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this firewall rule?')) {
            router.delete(`/firewall/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-hpText">Firewall Rules</h1>
                        <p className="text-sm text-hpText2 mt-1">Manage server firewall rules</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors"
                    >
                        {showForm ? (
                            <>
                                <span>✕</span>
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <span>+</span>
                                <span>Add Rule</span>
                            </>
                        )}
                    </button>
                </div>

                {/* UFW Status */}
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-hpText">UFW Firewall Status</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.reload({ only: ['ufw_status'] })}
                                className="text-[12px] text-hpAccent hover:text-hpAccent2"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Apply all active rules to UFW firewall?')) {
                                        router.post(route('firewall.apply'));
                                    }
                                }}
                                className="text-[12px] bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 px-3 py-1 rounded hover:bg-hpAccent/20"
                            >
                                Apply Rules
                            </button>
                        </div>
                    </div>
                    <pre className="text-[11px] text-hpText2 font-mono whitespace-pre-wrap overflow-x-auto">
                        {ufw_status || 'Loading...'}
                    </pre>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-hpBg2 rounded-xl shadow p-6 mb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-1">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({...form, type: e.target.value})}
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText"
                                    >
                                        <option value="deny">Deny</option>
                                        <option value="allow">Allow</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-1">Protocol</label>
                                    <select
                                        value={form.protocol}
                                        onChange={(e) => setForm({...form, protocol: e.target.value})}
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText"
                                    >
                                        <option value="all">All</option>
                                        <option value="tcp">TCP</option>
                                        <option value="udp">UDP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-1">Source IP/CIDR</label>
                                    <input
                                        type="text"
                                        value={form.source}
                                        onChange={(e) => setForm({...form, source: e.target.value})}
                                        placeholder="192.168.1.0/24 or 10.0.0.1"
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-1">Port (optional)</label>
                                    <input
                                        type="text"
                                        value={form.port}
                                        onChange={(e) => setForm({...form, port: e.target.value})}
                                        placeholder="80, 443, or 8000-9000"
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-hpText mb-1">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({...form, description: e.target.value})}
                                    placeholder="Optional description"
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="btn-primary">
                                    Save Rule
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Rules Table */}
                <div className="bg-hpBg2 rounded-xl shadow overflow-hidden">
                    {rules.length === 0 ? (
                        <div className="p-8 text-center text-hpText2">
                            No firewall rules yet. Add one to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-hpCard2">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-hpText2 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-hpText2 uppercase">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-hpText2 uppercase">Port</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-hpText2 uppercase">Protocol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-hpText2 uppercase">Description</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-hpText2 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-hpBorder">
                                    {rules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-hpCard2">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    rule.type === 'allow' 
                                                        ? 'bg-green-900 text-green-300' 
                                                        : 'bg-red-900 text-red-300'
                                                }`}>
                                                    {rule.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-hpText font-mono">{rule.source}</td>
                                            <td className="px-6 py-4 text-sm text-hpText">{rule.port || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-hpText uppercase">{rule.protocol}</td>
                                            <td className="px-6 py-4 text-sm text-hpText2">{rule.description || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(rule.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
