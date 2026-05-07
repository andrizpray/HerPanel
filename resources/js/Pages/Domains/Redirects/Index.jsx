import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function Index({ domain, redirects }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [redirectToDelete, setRedirectToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const openDeleteModal = (redirect) => {
        setRedirectToDelete(redirect);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setRedirectToDelete(null);
        setDeleteProcessing(false);
    };

    const handleDelete = () => {
        if (!redirectToDelete) return;
        
        setDeleteProcessing(true);
        router.delete(route('redirects.destroy', [domain.id, redirectToDelete.id]), {
            onSuccess: () => closeDeleteModal(),
            onError: () => setDeleteProcessing(false),
        });
    };

    const getRedirectTypeBadge = (type) => {
        const colors = {
            '301': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            '302': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            '307': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            '308': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        };
        return colors[type] || colors['301'];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-hpText leading-tight">
                        Redirect Rules - {domain.domain_name}
                    </h2>
                    <a
                        href={route('redirects.create', domain.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hpAccent hover:bg-hpAccent/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Redirect
                    </a>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-hpCard overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Back to Domains */}
                            <a
                                href={route('domains.index')}
                                className="inline-flex items-center gap-2 text-sm text-hpAccent hover:text-hpAccent/80 mb-6"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Domains
                            </a>

                            {/* Success Message */}
                            {usePage().props.flash?.success && (
                                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                                    {usePage().props.flash.success}
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                    ℹ️ About Redirect Rules
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    Redirect rules are processed in priority order (lower number = higher priority). 
                                    Source paths are matched against the request URI. Use 301 for permanent redirects, 
                                    302 for temporary redirects.
                                </p>
                            </div>

                            {/* Redirect Rules Table */}
                            {redirects.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-hpText">
                                        <thead className="text-xs uppercase bg-hpCard2 text-hpMuted">
                                            <tr>
                                                <th className="px-6 py-3">Priority</th>
                                                <th className="px-6 py-3">Source Path</th>
                                                <th className="px-6 py-3">Destination URL</th>
                                                <th className="px-6 py-3">Type</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {redirects.map((redirect) => (
                                                <tr key={redirect.id} className="border-b border-hpBorder hover:bg-hpCard2/50">
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-hpCard2 rounded text-xs">
                                                            {redirect.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs">
                                                        {redirect.source_path}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs">
                                                        <a 
                                                            href={redirect.destination_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-hpAccent hover:underline"
                                                        >
                                                            {redirect.destination_url.length > 50 
                                                                ? redirect.destination_url.substring(0, 50) + '...'
                                                                : redirect.destination_url}
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getRedirectTypeBadge(redirect.redirect_type)}`}>
                                                            {redirect.redirect_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            redirect.is_active 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {redirect.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={route('redirects.edit', [domain.id, redirect.id])}
                                                                className="text-hpAccent hover:text-hpAccent/80"
                                                            >
                                                                Edit
                                                            </a>
                                                            <button
                                                                onClick={() => openDeleteModal(redirect)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-hpMuted">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    <p className="text-lg mb-2">No redirect rules configured</p>
                                    <p className="text-sm">Add your first redirect rule to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-50" onClick={closeDeleteModal}></div>
                        <div className="relative bg-hpCard rounded-lg max-w-md w-full p-6 shadow-xl">
                            <h3 className="text-lg font-medium text-hpText mb-4">
                                Delete Redirect Rule
                            </h3>
                            <p className="text-sm text-hpMuted mb-6">
                                Are you sure you want to delete the redirect from{' '}
                                <span className="font-semibold text-hpText font-mono text-xs">
                                    {redirectToDelete?.source_path}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold text-hpText font-mono text-xs">
                                    {redirectToDelete?.destination_url}
                                </span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 bg-hpCard2 hover:bg-hpCard text-hpText rounded-lg text-sm"
                                    disabled={deleteProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
                                    disabled={deleteProcessing}
                                >
                                    {deleteProcessing ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
