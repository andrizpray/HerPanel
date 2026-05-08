import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ app, domains }) {
    const { data, setData, put, processing, errors } = useForm({
        domain_id: app.domain_id || '',
        type: app.type,
        name: app.name,
        path: app.path,
        port: app.port || '',
        entry_file: app.entry_file || '',
        status: app.status,
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(route('apps.update', app.id));
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-200 leading-tight">Edit App</h2>}
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
                                    <label className="block mb-1">Type *</label>
                                    <select
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        <option value="nodejs">Node.js</option>
                                        <option value="python">Python</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">App Name *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Application Path *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.path}
                                        onChange={e => setData('path', e.target.value)}
                                    />
                                    {errors.path && <div className="text-red-400 text-sm mt-1">{errors.path}</div>}
                                </div>
                                {data.type === 'nodejs' && (
                                    <div className="mb-4">
                                        <label className="block mb-1">Port *</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                            value={data.port}
                                            onChange={e => setData('port', e.target.value)}
                                        />
                                        {errors.port && <div className="text-red-400 text-sm mt-1">{errors.port}</div>}
                                    </div>
                                )}
                                {data.type === 'python' && (
                                    <div className="mb-4">
                                        <label className="block mb-1">Entry File *</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                            value={data.entry_file}
                                            onChange={e => setData('entry_file', e.target.value)}
                                        />
                                        {errors.entry_file && <div className="text-red-400 text-sm mt-1">{errors.entry_file}</div>}
                                    </div>
                                )}
                                <div className="mb-4">
                                    <label className="block mb-1">Status</label>
                                    <select
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="stopped">Stopped</option>
                                        <option value="active">Active</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Update
                                    </button>
                                    <Link href={route('apps.index')} className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500">
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
