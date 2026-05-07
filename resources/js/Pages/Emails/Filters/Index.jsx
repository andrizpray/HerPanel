import React, { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function Index() {
    const { filters, spamSettings, domains, emails } = usePage().props;
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSpamModal, setShowSpamModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const { data, setData, post, processing, reset, errors } = useForm({
        domain_id: '',
        email_id: '',
        name: '',
        conditions: '[]',
        actions: '[]',
    });

    const { data: spamData, setData: setSpamData, post: postSpam, processing: spamProcessing, reset: resetSpam } = useForm({
        domain_id: '',
        email_id: '',
        spam_threshold: '5.0',
        action_on_spam: 'move_to_junk',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        post(route('email-filters.filter.store'), {
            onSuccess: () => {
                setShowFilterModal(false);
                reset();
            },
        });
    };

    const handleSpamSubmit = (e) => {
        e.preventDefault();
        postSpam(route('email-filters.spam.store'), {
            onSuccess: () => {
                setShowSpamModal(false);
                resetSpam();
            },
        });
    };

    const handleDeleteFilter = (filter) => {
        setSelectedFilter(filter);
        setShowDeleteModal(true);
    };

    const confirmDeleteFilter = () => {
        router.delete(route('email-filters.filter.destroy', selectedFilter.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedFilter(null);
            },
        });
    };

    return (
        <AuthenticatedLayout header="Email Filters & Spam">
            <div className="p-6">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-hpText">Email Filters</h2>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                        >
                            + Add Filter
                        </button>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-hpBorder">
                                    <th className="text-left p-4 text-hpText">Name</th>
                                    <th className="text-left p-4 text-hpText">Domain</th>
                                    <th className="text-left p-4 text-hpText">Email</th>
                                    <th className="text-left p-4 text-hpText">Status</th>
                                    <th className="text-right p-4 text-hpText">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filters.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-hpMuted">
                                            No email filters found.
                                        </td>
                                    </tr>
                                ) : (
                                    filters.map((filter) => (
                                        <tr key={filter.id} className="border-b border-hpBorder hover:bg-hpBg2/50">
                                            <td className="p-4 text-hpText">{filter.name}</td>
                                            <td className="p-4 text-hpMuted">{filter.domain_name}</td>
                                            <td className="p-4 text-hpMuted">{filter.email_email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded ${filter.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                                    {filter.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteFilter(filter)}
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
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-hpText">Spam Settings</h2>
                        <button
                            onClick={() => setShowSpamModal(true)}
                            className="rounded bg-hpAccent px-4 py-2 text-sm font-medium text-white hover:bg-hpAccent/90"
                        >
                            + Add Setting
                        </button>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-hpBorder">
                                    <th className="text-left p-4 text-hpText">Domain</th>
                                    <th className="text-left p-4 text-hpText">Email</th>
                                    <th className="text-left p-4 text-hpText">Threshold</th>
                                    <th className="text-left p-4 text-hpText">Action</th>
                                    <th className="text-left p-4 text-hpText">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spamSettings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-hpMuted">
                                            No spam settings found.
                                        </td>
                                    </tr>
                                ) : (
                                    spamSettings.map((setting) => (
                                        <tr key={setting.id} className="border-b border-hpBorder hover:bg-hpBg2/50">
                                            <td className="p-4 text-hpMuted">{setting.domain_name}</td>
                                            <td className="p-4 text-hpMuted">{setting.email_email}</td>
                                            <td className="p-4 text-hpText">{setting.spam_threshold}</td>
                                            <td className="p-4 text-hpMuted">{setting.action_on_spam}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded ${setting.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                                    {setting.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Filter Create Modal */}
                {showFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-4">Create Email Filter</h3>
                            <form onSubmit={handleFilterSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                        placeholder="Filter name"
                                    />
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>
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
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Email (optional)</label>
                                    <select
                                        value={data.email_id}
                                        onChange={(e) => setData('email_id', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="">All emails in domain</option>
                                        {emails.map((email) => (
                                            <option key={email.id} value={email.id}>
                                                {email.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Conditions (JSON)</label>
                                    <textarea
                                        value={data.conditions}
                                        onChange={(e) => setData('conditions', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2 h-24"
                                        placeholder='[{"field":"subject","operator":"contains","value":"test"}]'
                                    />
                                    {errors.conditions && <div className="text-red-500 text-xs mt-1">{errors.conditions}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Actions (JSON)</label>
                                    <textarea
                                        value={data.actions}
                                        onChange={(e) => setData('actions', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2 h-24"
                                        placeholder='[{"type":"move","folder":"Junk"}]'
                                    />
                                    {errors.actions && <div className="text-red-500 text-xs mt-1">{errors.actions}</div>}
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
                                        onClick={() => setShowFilterModal(false)}
                                        className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Spam Settings Modal */}
                {showSpamModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowSpamModal(false)} />
                        <div className="relative bg-hpBg2 border border-hpBorder rounded-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-hpText mb-4">Spam Settings</h3>
                            <form onSubmit={handleSpamSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Domain (optional)</label>
                                    <select
                                        value={spamData.domain_id}
                                        onChange={(e) => setSpamData('domain_id', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="">All domains</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.id}>
                                                {domain.domain_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Email (optional)</label>
                                    <select
                                        value={spamData.email_id}
                                        onChange={(e) => setSpamData('email_id', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="">All emails</option>
                                        {emails.map((email) => (
                                            <option key={email.id} value={email.id}>
                                                {email.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Spam Threshold</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="10"
                                        value={spamData.spam_threshold}
                                        onChange={(e) => setSpamData('spam_threshold', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-hpText mb-2">Action on Spam</label>
                                    <select
                                        value={spamData.action_on_spam}
                                        onChange={(e) => setSpamData('action_on_spam', e.target.value)}
                                        className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                                    >
                                        <option value="move_to_junk">Move to Junk</option>
                                        <option value="delete">Delete</option>
                                        <option value="flag">Flag</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={spamProcessing}
                                        className="flex-1 rounded bg-hpAccent px-4 py-2 text-white font-medium disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSpamModal(false)}
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
                            <h3 className="text-lg font-bold text-hpText mb-2">Delete Filter</h3>
                            <p className="text-hpMuted mb-4">
                                Are you sure you want to delete <span className="font-bold text-hpText">{selectedFilter?.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDeleteFilter}
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
