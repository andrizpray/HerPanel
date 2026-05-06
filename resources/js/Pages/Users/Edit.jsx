import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ user, flash }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        is_active: user.is_active,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-hpAccent" />
                        Edit User
                    </span>
                    <Link
                        href={route('users.index')}
                        className="text-[12px] text-hpText3 hover:text-hpText transition-colors"
                    >
                        ← Back to Users
                    </Link>
                </div>
            }
        >
            <Head title="Edit User" />

            <div className="px-4 sm:px-6 py-6">
                <div className="max-w-2xl mx-auto">
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

                    <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-[12px] text-hpText2 font-medium mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-hpBg border border-hpBorder rounded-lg text-[13px] text-white placeholder-hpText3 focus:border-hpAccent focus:outline-none transition-colors"
                                />
                                {errors.name && <div className="text-[11px] text-red-400 mt-1">{errors.name}</div>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[12px] text-hpText2 font-medium mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-hpBg border border-hpBorder rounded-lg text-[13px] text-white placeholder-hpText3 focus:border-hpAccent focus:outline-none transition-colors"
                                />
                                {errors.email && <div className="text-[11px] text-red-400 mt-1">{errors.email}</div>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[12px] text-hpText2 font-medium mb-1.5">
                                    Password <span className="text-hpText3 text-[11px]">(leave blank to keep current)</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-hpBg border border-hpBorder rounded-lg text-[13px] text-white placeholder-hpText3 focus:border-hpAccent focus:outline-none transition-colors"
                                    placeholder="New password (optional)"
                                />
                                {errors.password && <div className="text-[11px] text-red-400 mt-1">{errors.password}</div>}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-[12px] text-hpText2 font-medium mb-1.5">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-hpBg border border-hpBorder rounded-lg text-[13px] text-white focus:border-hpAccent focus:outline-none transition-colors appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                                >
                                    <option value="user">👤 User</option>
                                    <option value="admin">👑 Admin</option>
                                </select>
                                {errors.role && <div className="text-[11px] text-red-400 mt-1">{errors.role}</div>}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <div className="text-[12px] text-hpText2 font-medium">Active Status</div>
                                    <div className="text-[11px] text-hpText3 mt-0.5">User can login when active</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : 'bg-hpBorder'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.is_active ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-hpBorder/50">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-hpAccent text-white text-[12px] font-medium px-4 py-2.5 rounded-lg hover:bg-hpAccent/90 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update User'}
                                </button>
                                <Link
                                    href={route('users.index')}
                                    className="flex-1 text-center px-4 py-2.5 bg-hpBg border border-hpBorder rounded-lg text-[12px] text-hpText2 hover:bg-hpBg2 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
