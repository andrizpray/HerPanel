import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ backpus, domains }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data, setData, post, processing, reset } = useForm({
        domain_id: '',
        backup_type: 'full',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('backups.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this backup?')) {
            router.delete(route('backups.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: 'bg-hpWarn/10', text: 'text-hpWarn', dot: 'bg-hpWarn' },
            completed: { bg: 'bg-hpSuccess/10', text: 'text-hpSuccess', dot: 'bg-hpSuccess' },
            failed: { bg: 'bg-hpDanger/10', text: 'text-hpDanger', dot: 'bg-hpDanger' },
        };
        const s = map[status] || map.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} border border-current/20`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '-';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-hpBg">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-hpText">Backups</h1>
                            <p className="text-sm text-hpText2 mt-1">Manage your server and site backups</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-hpAccent hover:bg-hpAccent2 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Backup
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                            <div className="text-xs text-hpText2 uppercase tracking-wider">Total Backups</div>
                            <div className="text-xl font-bold text-hpText mt-1">{backpus.length}</div>
                        </div>
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                            <div className="text-xs text-hpText2 uppercase tracking-wider">Completed</div>
                            <div className="text-xl font-bold text-hpSuccess mt-1">
                                {backpus.filter(b => b.status === 'completed').length}
                            </div>
                        </div>
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                            <div className="text-xs text-hpText2 uppercase tracking-wider">Pending</div>
                            <div className="text-xl font-bold text-hpWarn mt-1">
                                {backpus.filter(b => b.status === 'pending').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="px-4 sm:px-6 pb-6">
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="bg-hpBg3/50 border-b border-hpBorder/50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Domain</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Type</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Size</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3.5 text-right text-xs font-semibold text-hpText2 uppercase tracking-wider hidden md:table-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backpus.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-8 text-center text-hpText2">
                                                No backups yet. Create your first backup!
                                            </td>
                                        </tr>
                                    ) : (
                                        backpus.map((backup) => (
                                            <tr key={backup.id} className="border-b border-hpBorder/50 hover:bg-hpBg3/30 transition-colors">
                                                <td className="px-5 py-3.5 text-sm text-hpText">
                                                    {backup.domain ? backup.domain.domain_name : 'Server'}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-hpText2 capitalize">{backup.backup_type}</td>
                                                <td className="px-5 py-3.5 text-sm text-hpText2">{formatBytes(backup.file_size)}</td>
                                                <td className="px-5 py-3.5">{getStatusBadge(backup.status)}</td>
                                                <td className="px-5 py-3.5 text-sm text-hpText2">
                                                    {new Date(backup.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-3.5 text-right hidden md:table-cell">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDelete(backup.id)}
                                                            className="px-3 py-1.5 text-xs font-medium text-hpDanger bg-hpDanger/10 border border-hpDanger/20 rounded-lg hover:bg-hpDanger/20 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                        <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-hpText mb-4">Create New Backup</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-hpText2 mb-2">Domain (Optional)</label>
                                    <select
                                        value={data.domain_id}
                                        onChange={(e) => setData('domain_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    >
                                        <option value="">Server Only</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.id}>{domain.domain_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-hpText2 mb-2">Backup Type</label>
                                    <select
                                        value={data.backup_type}
                                        onChange={(e) => setData('backup_type', e.target.value)}
                                        className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    >
                                        <option value="full">Full (Files + Database)</option>
                                        <option value="database">Database Only</option>
                                        <option value="files">Files Only</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-hpText2 hover:text-hpText transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-hpAccent hover:bg-hpAccent2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Backup'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
