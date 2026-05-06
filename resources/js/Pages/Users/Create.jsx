import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create User" />
            <div className="px-4 sm:px-6 py-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href={route('users.index')}
                            className="text-hpText2 hover:text-hpText transition-colors"
                        >
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-hpText">Create User</h1>
                    </div>

                    <div className="bg-hpBg2 border border-hpBorder rounded-xl p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    placeholder="Full name"
                                />
                                {errors.name && <p className="text-hpDanger text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-hpDanger text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    placeholder="Min. 8 characters"
                                />
                                {errors.password && <p className="text-hpDanger text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <p className="text-hpDanger text-xs mt-1">{errors.role}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-hpBorder bg-hpBg text-hpAccent focus:ring-hpAccent"
                                    />
                                    <span className="text-sm text-hpText2">Active (user can login)</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    href={route('users.index')}
                                    className="px-4 py-2 text-sm font-medium text-hpText2 hover:text-hpText transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-hpAccent hover:bg-hpAccent2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
