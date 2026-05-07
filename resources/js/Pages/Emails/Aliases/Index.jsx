import React, { useState } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function Index() {
    const { aliases, domains } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAlias, setSelectedAlias] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showSourcePassword, setShowSourcePassword] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        domain_id: '',
        source: '',
        destination: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('aliases.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleDelete = (alias) => {
        setSelectedAlias(alias);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('aliases.destroy', selectedAlias.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedAlias(null);
            },
        });
    };

    if (isMobile) {
        return (
            <AuthenticatedLayout header="Email Aliases">
                <div className="space-y-4 p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-hpText">Email Aliases</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                        >
                            Add Alias
                        </button>
                    </div>

                    {aliases.length === 0 ? (
                        <div className="text-center py-8 text-hpMuted">No email aliases found.</div>
                    ) : (
                        aliases.map((alias) => (
                            <div
                                key={alias.id}
                                onClick={() => setSelectedAlias(alias)}
                                className="bg-hpBg2 border border-hpBorder rounded-lg p-4 cursor-pointer hover:bg-hpBg2/80"
                            >
                                <div className="font-medium text-hpText">{alias.source}</div>
                                <div className="text-sm text-hpMuted">→ {alias.destination}</div>
                                <div className="text-xs text-hpMuted mt-1">
                                    Domain: {alias.domain?.domain_name}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile Action Modal */}
                {selectedAlias && !showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedAlias(null)} />
                        <div className="relative bg-hpBg2 border-t border-hpBorder rounded-t-xl w-full p-6 space-y-4">
                            <div className="text-lg font-bold text-hpText">{selectedAlias.source}</div>
                            <div className="text-sm text-hpMuted">Forwards to: {selectedAlias.destination}</div>
                            <button
                                onClick={() => handleDelete(selectedAlias)}
                                className="w-full rounded bg-red-600 px-4 py-3 text-white font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedAlias(null)}
                                className="w-full rounded bg-hpBorder px-4 py-3 text-hpText font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-4">Create Email Alias</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Domain</label>
                                    <select
                                        value={data.domain_id}
                                        onChange={(e) => setData('domain_id', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="">Select domain</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.id}>
                                                {domain.domain_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.domain_id && <div className="text-red-500 text-xs mt-1">{errors.domain_id}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Source Email Prefix</label>
                                    <input
                                        type="text"
                                        value={data.source}
                                        onChange={(e) => setData('source', e.target.value)}
                                        placeholder="e.g., info"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {data.source && data.domain_id && (
                                        <div className="text-xs text-hpMuted mt-1">
                                            Source: {data.source}@{domains.find(d => d.id == data.domain_id)?.domain_name}
                                        </div>
                                    )}
                                    {errors.source && <div className="text-red-500 text-xs mt-1">{errors.source}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Forward To (Destination)</label>
                                    <input
                                        type="email"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        placeholder="e.g., personal@gmail.com"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {errors.destination && <div className="text-red-500 text-xs mt-1">{errors.destination}</div>}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded bg-hpAccent px-4 py-2 text-white font-medium disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-2">Delete Alias</h3>
                            <p className="text-hpMuted mb-4">
                                Are you sure you want to delete <span className="font-bold text-hpText">{selectedAlias?.source}</span>?
                                <br />
                                <span className="text-sm">Emails will no longer be forwarded to {selectedAlias?.destination}</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded bg-red-600 px-4 py-2 text-white font-medium"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header="Email Aliases">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-hpText">Email Aliases</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                    >
                        + Add Alias
                    </button>
                </div>

                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-hpBorder">
                                <th className="text-left p-4 text-hpText">Source</th>
                                <th className="text-left p-4 text-hpText">Forwards To</th>
                                <th className="text-left p-4 text-hpText">Domain</th>
                                <th className="text-right p-4 text-hpText">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aliases.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-hpMuted">
                                        No email aliases found.
                                    </td>
                                </tr>
                            ) : (
                                aliases.map((alias) => (
                                    <tr key={alias.id} className="border-b border-hpBorder hover:bg-hpBg2/50">
                                        <td className="p-4 text-hpText">{alias.source}</td>
                                        <td className="p-4 text-hpMuted">{alias.destination}</td>
                                        <td className="p-4 text-hpMuted">{alias.domain?.domain_name}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(alias)}
                                                className="text-red-500 hover:underline text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-4">Create Email Alias</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Domain</label>
                                    <select
                                        value={data.domain_id}
                                        onChange={(e) => setData('domain_id', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="">Select domain</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.id}>
                                                {domain.domain_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.domain_id && <div className="text-red-500 text-xs mt-1">{errors.domain_id}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Source Email Prefix</label>
                                    <input
                                        type="text"
                                        value={data.source}
                                        onChange={(e) => setData('source', e.target.value)}
                                        placeholder="e.g., info"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {data.source && data.domain_id && (
                                        <div className="text-xs text-hpMuted mt-1">
                                            Source: {data.source}@{domains.find(d => d.id == data.domain_id)?.domain_name}
                                        </div>
                                    )}
                                    {errors.source && <div className="text-red-500 text-xs mt-1">{errors.source}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Forward To (Destination)</label>
                                    <input
                                        type="email"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        placeholder="e.g., personal@gmail.com"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {errors.destination && <div className="text-red-500 text-xs mt-1">{errors.destination}</div>}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded bg-hpAccent px-4 py-2 text-white font-medium disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-2">Delete Alias</h3>
                            <p className="text-hpMuted mb-4">
                                Are you sure you want to delete <span className="font-bold text-hpText">{selectedAlias?.source}</span>?
                                <br />
                                <span className="text-sm">Emails will no longer be forwarded to {selectedAlias?.destination}</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded bg-red-600 px-4 py-2 text-white font-medium"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
