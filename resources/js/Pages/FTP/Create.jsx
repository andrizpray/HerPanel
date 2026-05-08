import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ domains }) {
    const { data, setData, post, processing, errors } = useForm({
        domain_id: '',
        username: '',
        password: '',
        quota_mb: 0,
        directory: '',
        status: 'active',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('ftp.store'));
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-200 leading-tight">Create FTP User</h2>}
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-300">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block mb-1">Domain (optional)</label>
                                    <select
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.domain_id}
                                        onChange={e => setData('domain_id', e.target.value)}
                                    >
                                        <option value="">None</option>
                                        {domains.map(domain => (
                                            <option key={domain.id} value={domain.id}>{domain.domain_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Username *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value)}
                                    />
                                    {errors.username && <div className="text-red-400 text-sm mt-1">{errors.username}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Password *</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Quota (MB, 0 = unlimited)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.quota_mb}
                                        onChange={e => setData('quota_mb', e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Directory (optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.directory}
                                        onChange={e => setData('directory', e.target.value)}
                                        placeholder="/var/www/domain.com"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Status</label>
                                    <select
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                    <Link href={route('ftp.index')} className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
