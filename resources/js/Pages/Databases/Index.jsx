import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ databases, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [databaseToDelete, setDatabaseToDelete] = useState(null);

    const handleDelete = (database) => {
        setDatabaseToDelete(database);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('databases.destroy', databaseToDelete.id), {
            onSuccess: () => setShowDeleteModal(false)
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Databases" />
            
            <div className="p-5 md:p-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[15px] font-semibold text-white">Databases</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Manage your MySQL databases</p>
                    </div>
                    <Link
                        href={route('databases.create')}
                        className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors w-fit"
                    >
                        + Create Database
                    </Link>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Databases List */}
                {databases.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">⊞</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No databases yet</div>
                        <div className="text-[12px] text-hpText3 mb-4">Create your first MySQL database</div>
                        <Link
                            href={route('databases.create')}
                            className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                        >
                            + Create First Database
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {databases.map((db) => (
                            <div key={db.id} className="bg-hpBg2 border border-hpBorder rounded-xl p-5 hover:border-hpBorder/80 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[12px] font-semibold">
                                            DB
                                        </span>
                                        <div>
                                            <div className="text-[13px] text-white font-medium">{db.db_name}</div>
                                            <div className="text-[11px] text-hpText3 mt-0.5">User: {db.db_user}</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        ACTIVE
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-hpText3">Character Set</span>
                                        <span className="text-white">{db.character_set}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-hpText3">Collation</span>
                                        <span className="text-white">{db.collation}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('databases.edit', db.id)}
                                        className="flex-1 text-center py-2 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[11px] font-medium hover:bg-hpBg2 transition-all"
                                    >
                                        Change Password
                                    </Link>
                                    <Link
                                        href={route('databases.phpmyadmin', db.id)}
                                        className="flex-1 text-center py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md text-[11px] font-medium hover:bg-blue-500/20 transition-all"
                                    >
                                        phpMyAdmin
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(db)}
                                        className="px-3 py-2 bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors rounded-md"
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
            {showDeleteModal && databaseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-[13px] text-white font-medium mb-2">Delete Database</h3>
                        <p className="text-[12px] text-hpText2 mb-4">
                            Are you sure you want to delete database <span className="text-white font-medium">{databaseToDelete.db_name}</span>?
                            <br /><br />
                            This action cannot be undone. The database and all its data will be permanently deleted.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-md text-[12px] font-medium hover:bg-red-400 transition-all"
                            >
                                Delete Database
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
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
