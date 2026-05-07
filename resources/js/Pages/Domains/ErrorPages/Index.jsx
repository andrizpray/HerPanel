import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ domain, errorPages, availableCodes, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorPageToDelete, setErrorPageToDelete] = useState(null);

    const handleDelete = (errorPage) => {
        setErrorPageToDelete(errorPage);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (errorPageToDelete) {
            router.delete(route('error-pages.destroy', [errorPageToDelete.domain_id, errorPageToDelete.id]), {
                onFinish: () => {
                    setShowDeleteModal(false);
                    setErrorPageToDelete(null);
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <Link href={route('domains.index')} className="text-hpText3 hover:text-white transition-colors">
                        ← Domains
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Error Pages: {domain.domain_name}
                </span>
            }
        >
            <Head title={`Error Pages: ${domain.domain_name}`} />

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Domain</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{domain.domain_name}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Error Pages</div>
                    <div className="text-2xl font-semibold text-orange-400 tabular-nums">{errorPages.length}</div>
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
                        <span className="text-[13px] text-white font-medium">Error Pages</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {errorPages.length} total
                        </span>
                    </div>
                    <Link
                        href={route('error-pages.create', domain.id)}
                        className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors"
                    >
                        + Add Error Page
                    </Link>
                </div>

                {/* Error Pages List */}
                {errorPages.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">⚠️</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No custom error pages yet</div>
                        <div className="text-[12px] text-hpText3 mb-4">Add your first custom error page using the button above</div>
                        <Link
                            href={route('error-pages.create', domain.id)}
                            className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                        >
                            + Add Error Page
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-hpBorder/50">
                        {errorPages.map((errorPage) => (
                            <div key={errorPage.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-hpAccent/3 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold
                                        ${errorPage.is_active 
                                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' 
                                            : 'bg-hpBg border border-hpBorder text-hpText3'}`}>
                                        {errorPage.error_code}
                                    </span>
                                    <div>
                                        <div className="text-[13px] text-white font-medium">
                                            Error {errorPage.error_code}
                                        </div>
                                        <div className="text-[11px] text-hpText3">
                                            Status: <span className={`font-medium ${errorPage.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {errorPage.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('error-pages.edit', [domain.id, errorPage.id])}
                                        className="px-3 py-1.5 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(errorPage)}
                                        className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && errorPageToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[13px] text-white font-medium mb-3">Delete Error Page</div>
                        <div className="text-[12px] text-hpText2 mb-5">
                            Are you sure you want to delete the custom error page for <span className="text-white font-medium">Error {errorPageToDelete.error_code}</span>?
                            <div className="mt-2 text-[11px] text-hpText3">This action cannot be undone.</div>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-hpText2 hover:bg-hpBg2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md text-[12px] font-medium hover:bg-red-400 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
