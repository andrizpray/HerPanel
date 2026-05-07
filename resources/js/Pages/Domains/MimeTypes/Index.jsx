import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function Index({ domain, mimeTypes }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mimeTypeToDelete, setMimeTypeToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const openDeleteModal = (mimeType) => {
        setMimeTypeToDelete(mimeType);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setMimeTypeToDelete(null);
        setDeleteProcessing(false);
    };

    const handleDelete = () => {
        if (!mimeTypeToDelete) return;
        
        setDeleteProcessing(true);
        router.delete(route('mime-types.destroy', [domain.id, mimeTypeToDelete.id]), {
            onSuccess: () => closeDeleteModal(),
            onError: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-hpText leading-tight">
                        MIME Types - {domain.domain_name}
                    </h2>
                    <a
                        href={route('mime-types.create', domain.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hpAccent hover:bg-hpAccent/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add MIME Type
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

                            {/* MIME Types Table */}
                            {mimeTypes.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-hpText">
                                        <thead className="text-xs uppercase bg-hpCard2 text-hpMuted">
                                            <tr>
                                                <th className="px-6 py-3">Extension</th>
                                                <th className="px-6 py-3">MIME Type</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mimeTypes.map((mimeType) => (
                                                <tr key={mimeType.id} className="border-b border-hpBorder hover:bg-hpCard2/50">
                                                    <td className="px-6 py-4 font-medium">
                                                        .{mimeType.extension}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {mimeType.mime_type}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            mimeType.is_active 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {mimeType.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={route('mime-types.edit', [domain.id, mimeType.id])}
                                                                className="text-hpAccent hover:text-hpAccent/80"
                                                            >
                                                                Edit
                                                            </a>
                                                            <button
                                                                onClick={() => openDeleteModal(mimeType)}
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg mb-2">No MIME types configured</p>
                                    <p className="text-sm">Add your first MIME type to get started</p>
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
                                Delete MIME Type
                            </h3>
                            <p className="text-sm text-hpMuted mb-6">
                                Are you sure you want to delete the MIME type for{' '}
                                <span className="font-semibold text-hpText">.{mimeTypeToDelete?.extension}</span>?
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
