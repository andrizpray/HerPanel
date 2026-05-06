import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ users, flash }) {
    const [showMobileActions, setShowMobileActions] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', id));
        }
    };

    const handleToggleActive = (id) => {
        router.post(route('users.toggle-active', id));
    };

    const openMobileActions = (user) => {
        setSelectedUser(user);
        setShowMobileActions(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-hpAccent" />
                    User Management
                </span>
            }
        >
            <Head title="Users" />

            <div className="px-4 sm:px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-hpText">Users</h1>
                            <p className="text-sm text-hpText3 mt-1">Manage user accounts and permissions</p>
                        </div>
                        <Link
                            href={route('users.create')}
                            className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors"
                        >
                            + Add User
                        </Link>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                            ✓ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                            ✗ {flash.error}
                        </div>
                    )}

                    {/* Users Display */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        {users.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-3xl mb-3 opacity-30">👤</div>
                                <div className="text-[13px] text-hpText2 font-medium mb-2">No users yet</div>
                                <div className="text-[12px] text-hpText3 mb-4">Get started by adding a new user</div>
                                <Link
                                    href={route('users.create')}
                                    className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                                >
                                    + Add First User
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                {!isMobile && (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-hpBg/50">
                                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Name</th>
                                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Email</th>
                                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Role</th>
                                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="transition-colors hover:bg-hpAccent/3"
                                                >
                                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold
                                                                ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-hpBg border border-hpBorder text-hpAccent2'}`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="text-[13px] text-white font-medium">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-[12px] text-hpText2">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border
                                                            ${user.role === 'admin' 
                                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                                            {user.role === 'admin' ? '👑' : '👤'} {user.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                                        <button
                                                            onClick={() => handleToggleActive(user.id)}
                                                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors
                                                                ${user.is_active 
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'}`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route('users.edit', user.id)}
                                                                className="px-3 py-1.5 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Mobile Card View */}
                                {isMobile && (
                                    <div className="divide-y divide-hpBorder/50">
                                        {users.map((user) => (
                                            <div key={user.id} className="p-4 hover:bg-hpAccent/3 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-[12px] font-semibold
                                                            ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-hpBg border border-hpBorder text-hpAccent2'}`}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <div className="text-[13px] text-white font-medium">{user.name}</div>
                                                            <div className="text-[11px] text-hpText3">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openMobileActions(user)}
                                                        className="p-2 hover:bg-hpBg2 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-hpText3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 ml-13">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border
                                                        ${user.role === 'admin' 
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                                        {user.role === 'admin' ? '👑' : '👤'} {user.role.toUpperCase()}
                                                    </span>
                                                    <button
                                                        onClick={() => handleToggleActive(user.id)}
                                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors
                                                            ${user.is_active 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                                : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Actions Modal */}
            {showMobileActions && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowMobileActions(false)}>
                    <div className="bg-hpBg2 border-t border-hpBorder rounded-t-2xl w-full max-w-lg p-4 space-y-2" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-2">
                            <div className="text-[13px] text-hpText font-medium">{selectedUser.name}</div>
                            <div className="text-[11px] text-hpText3">{selectedUser.email}</div>
                        </div>
                        <Link
                            href={route('users.edit', selectedUser.id)}
                            className="block w-full text-center px-4 py-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-[12px] text-blue-400 hover:bg-blue-500/20 transition-colors"
                            onClick={() => setShowMobileActions(false)}
                        >
                            ✏️ Edit User
                        </Link>
                        <button
                            onClick={() => {
                                handleToggleActive(selectedUser.id);
                                setShowMobileActions(false);
                            }}
                            className={`block w-full text-center px-4 py-3 rounded-md border text-[12px] transition-colors
                                ${selectedUser.is_active 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                        >
                            {selectedUser.is_active ? '🔴 Deactivate' : '🟢 Activate'}
                        </button>
                        <button
                            onClick={() => {
                                handleDelete(selectedUser.id);
                                setShowMobileActions(false);
                            }}
                            className="block w-full text-center px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-[12px] text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            🗑️ Delete User
                        </button>
                        <button
                            onClick={() => setShowMobileActions(false)}
                            className="block w-full text-center px-4 py-3 rounded-md bg-hpBg border border-hpBorder text-[12px] text-hpText2 hover:bg-hpBg2 transition-colors mt-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
