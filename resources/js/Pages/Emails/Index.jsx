import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ emailAccounts, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showMobileActions, setShowMobileActions] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredAccounts = emailAccounts.filter(account =>
        account.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (account) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        // TODO: Implement delete with Inertia
        setShowDeleteModal(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Email Accounts" />
            
            <div className="p-5 md:p-8">
                <div className="max-w-6xl">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-[15px] font-semibold text-white">Email Accounts</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Manage your email accounts</p>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-lg">
                            {flash.success}
                        </div>
                    )}

                    {/* Search & Create */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search email accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 bg-hpBg2 border border-hpBorder rounded-lg text-[12px] text-white placeholder-hpText3 focus:outline-none focus:border-hpAccent transition-colors"
                            />
                        </div>
                        <Link
                            href={route('emails.create')}
                            className="inline-flex items-center justify-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2.5 rounded-lg font-medium hover:bg-hpAccent/90 transition-colors whitespace-nowrap"
                        >
                            + Create Email
                        </Link>
                    </div>

                    {/* Email List */}
                    {filteredAccounts.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-3xl mb-3 opacity-30">✉</div>
                            <div className="text-[13px] text-hpText2 font-medium mb-2">
                                {searchQuery ? 'No email accounts found' : 'No email accounts yet'}
                            </div>
                            <div className="text-[12px] text-hpText3 mb-4">
                                {searchQuery ? 'Try a different search term' : 'Create your first email account'}
                            </div>
                            {!searchQuery && (
                                <Link
                                    href={route('emails.create')}
                                    className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                                >
                                    + Create First Email
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="bg-hpBg2 border border-hpBorder rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-hpBorder">
                                        <th className="text-left text-[11px] text-hpText3 uppercase tracking-wider p-4">Email</th>
                                        <th className="text-left text-[11px] text-hpText3 uppercase tracking-wider p-4">Domain</th>
                                        <th className="text-left text-[11px] text-hpText3 uppercase tracking-wider p-4">Quota</th>
                                        <th className="text-left text-[11px] text-hpText3 uppercase tracking-wider p-4">Status</th>
                                        <th className="text-right text-[11px] text-hpText3 uppercase tracking-wider p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.map((account) => (
                                        <tr key={account.id} className="border-b border-hpBorder/50 hover:bg-hpBg/50 transition-colors">
                                            <td className="p-4 text-[12px] text-white">
                                                {isMobile ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmail(account);
                                                            setShowMobileActions(true);
                                                        }}
                                                        className="text-left hover:text-sky-400 transition-colors"
                                                    >
                                                        {account.email}
                                                    </button>
                                                ) : (
                                                    account.email
                                                )}
                                            </td>
                                            <td className="p-4 text-[12px] text-hpText2">{account.domain?.domain_name}</td>
                                            <td className="p-4 text-[12px] text-hpText2">{account.quota_mb} MB</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                                    account.is_active 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {account.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right hidden md:table-cell">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('emails.edit', account.id)}
                                                        className="px-3 py-1.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[11px] font-medium hover:bg-hpBg2 transition-all"
                                                    >
                                                        Change Password
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(account)}
                                                        className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors rounded-md"
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
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && accountToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-[13px] text-white font-medium mb-2">Delete Email Account</h3>
                        <p className="text-[12px] text-hpText2 mb-4">
                            Are you sure you want to delete email <span className="text-white font-medium">{accountToDelete.email}</span>?
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-md text-[12px] font-medium hover:bg-red-400 transition-all"
                            >
                                Delete Email
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

            {/* Mobile Email Actions Modal */}
            {showMobileActions && selectedEmail && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMobileActions(false)} />
                    <div className="relative w-full bg-hpBg2 border-t border-hpBorder rounded-t-xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[13px] text-white font-medium">{selectedEmail.email}</h3>
                            <button onClick={() => setShowMobileActions(false)} className="text-hpText2 hover:text-white">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            <Link
                                href={route('emails.edit', selectedEmail.id)}
                                onClick={() => setShowMobileActions(false)}
                                className="block w-full px-4 py-3 bg-hpBg border border-hpBorder text-hpText2 rounded-lg text-[12px] font-medium hover:bg-hpBg2 text-left transition-colors"
                            >
                                🔒 Change Password
                            </Link>
                            <button
                                onClick={() => {
                                    handleDelete(selectedEmail);
                                    setShowMobileActions(false);
                                }}
                                className="block w-full px-4 py-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-lg text-[12px] font-medium hover:bg-red-500/10 text-left transition-colors"
                            >
                                🗑️ Delete Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
