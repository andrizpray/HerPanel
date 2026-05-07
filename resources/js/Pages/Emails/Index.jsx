import React, { useState } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function Index() {
    const { emails, domains } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const { data, setData, post, processing, reset, errors } = useForm({
        domain_id: '',
        prefix: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('emails.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleDelete = (email) => {
        setSelectedEmail(email);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('emails.destroy', selectedEmail.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedEmail(null);
            },
        });
    };

    const openActionModal = (email) => {
        setSelectedEmail(email);
    };

    if (isMobile) {
        return (
            <AuthenticatedLayout header="Email Accounts">
                <div className="space-y-4 p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-hpText">Email Accounts</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                        >
                            Add Email
                        </button>
                    </div>

                    {emails.length === 0 ? (
                        <div className="text-center py-8 text-hpMuted">No email accounts found.</div>
                    ) : (
                        emails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => openActionModal(email)}
                                className="bg-hpBg2 border border-hpBorder rounded-lg p-4 cursor-pointer hover:bg-hpBg2/80"
                            >
                                <div className="font-medium text-hpText">{email.email}</div>
                                <div className="text-sm text-hpMuted">{email.domain_name}</div>
                                <div className="text-xs text-hpMuted mt-1">
                                    Created: {new Date(email.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile Action Modal */}
                {selectedEmail && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedEmail(null)} />
                        <div className="relative bg-hpBg2 border-t border-hpBorder rounded-t-xl w-full p-6 space-y-4">
                            <div className="text-lg font-bold text-hpText">{selectedEmail.email}</div>
                            <button
                                onClick={() => {
                                    router.get(route('emails.edit', selectedEmail.id));
                                }}
                                className="w-full rounded bg-hpAccent px-4 py-3 text-white font-medium"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={() => handleDelete(selectedEmail)}
                                className="w-full rounded bg-red-600 px-4 py-3 text-white font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedEmail(null)}
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
                            <h3 className="text-lg font-bold text-hpText mb-4">Create Email Account</h3>
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
                                    <label className="block text-sm text-hpText mb-2">Email Prefix</label>
                                    <input
                                        type="text"
                                        value={data.prefix}
                                        onChange={(e) => setData('prefix', e.target.value)}
                                        placeholder="e.g., info"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {data.prefix && data.domain_id && (
                                        <div className="text-xs text-hpMuted mt-1">
                                            Email: {data.prefix}@{domains.find(d => d.id == data.domain_id)?.domain_name}
                                        </div>
                                    )}
                                    {errors.prefix && <div className="text-red-500 text-xs mt-1">{errors.prefix}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-hpMuted hover:text-hpText"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-xs text-hpMuted mt-1">Min. 8 characters</div>
                                    {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
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
                            <h3 className="text-lg font-bold text-hpText mb-2">Delete Email</h3>
                            <p className="text-hpMuted mb-4">
                                Are you sure you want to delete <span className="font-bold text-hpText">{selectedEmail?.email}</span>?
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
        <AuthenticatedLayout header="Email Accounts">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-hpText">Email Accounts</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                    >
                        + Add Email
                    </button>
                </div>

                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-hpBorder">
                                <th className="text-left p-4 text-hpText">Email</th>
                                <th className="text-left p-4 text-hpText">Domain</th>
                                <th className="text-left p-4 text-hpText">Created</th>
                                <th className="text-right p-4 text-hpText">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emails.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-hpMuted">
                                        No email accounts found.
                                    </td>
                                </tr>
                            ) : (
                                emails.map((email) => (
                                    <tr key={email.id} className="border-b border-hpBorder hover:bg-hpBg2/50">
                                        <td className="p-4 text-hpText">{email.email}</td>
                                        <td className="p-4 text-hpMuted">{email.domain_name}</td>
                                        <td className="p-4 text-hpMuted">
                                            {new Date(email.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => router.get(route('emails.edit', email.id))}
                                                className="text-hpAccent hover:underline text-sm"
                                            >
                                                Password
                                            </button>
                                            <button
                                                onClick={() => handleDelete(email)}
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
                            <h3 className="text-lg font-bold text-hpText mb-4">Create Email Account</h3>
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
                                    <label className="block text-sm text-hpText mb-2">Email Prefix</label>
                                    <input
                                        type="text"
                                        value={data.prefix}
                                        onChange={(e) => setData('prefix', e.target.value)}
                                        placeholder="e.g., info"
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText placeholder:text-hpMuted px-3 py-2"
                                    />
                                    {data.prefix && data.domain_id && (
                                        <div className="text-xs text-hpMuted mt-1">
                                            Email: {data.prefix}@{domains.find(d => d.id == data.domain_id)?.domain_name}
                                        </div>
                                    )}
                                    {errors.prefix && <div className="text-red-500 text-xs mt-1">{errors.prefix}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-hpMuted hover:text-hpText"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-xs text-hpMuted mt-1">Min. 8 characters</div>
                                    {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
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
                            <h3 className="text-lg font-bold text-hpText mb-2">Delete Email</h3>
                            <p className="text-hpMuted mb-4">
                                Are you sure you want to delete <span className="font-bold text-hpText">{selectedEmail?.email}</span>?
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
