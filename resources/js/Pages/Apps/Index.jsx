import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ apps, domains }) {
    const { delete: destroy, post } = useForm();

    function handleDelete(id) {
        if (confirm('Are you sure you want to delete this app?')) {
            destroy(route('apps.destroy', id));
        }
    }

    function handleStart(id) {
        post(route('apps.start', id));
    }

    function handleStop(id) {
        post(route('apps.stop', id));
    }

    function handleRestart(id) {
        post(route('apps.restart', id));
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-200 leading-tight">Apps Management (Node.js & Python)</h2>}
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-300">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-medium">Applications</h3>
                                <Link
                                    href={route('apps.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add New App
                                </Link>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="py-2">Name</th>
                                        <th>Type</th>
                                        <th>Domain</th>
                                        <th>Port</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apps.data.map((app) => (
                                        <tr key={app.id} className="border-b border-gray-700">
                                            <td className="py-2">{app.name}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs ${app.type === 'nodejs' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                                                    {app.type}
                                                </span>
                                            </td>
                                            <td>{app.domain ? app.domain.domain_name : 'N/A'}</td>
                                            <td>{app.port || '-'}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs ${app.status === 'active' ? 'bg-green-600' : (app.status === 'stopped' ? 'bg-gray-600' : 'bg-red-600')}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="space-x-2">
                                                {app.status !== 'active' && (
                                                    <button onClick={() => handleStart(app.id)} className="text-green-400 hover:underline text-sm">Start</button>
                                                )}
                                                {app.status === 'active' && (
                                                    <button onClick={() => handleStop(app.id)} className="text-red-400 hover:underline text-sm">Stop</button>
                                                )}
                                                <button onClick={() => handleRestart(app.id)} className="text-blue-400 hover:underline text-sm">Restart</button>
                                                <Link href={route('apps.edit', app.id)} className="text-blue-400 hover:underline text-sm">Edit</Link>
                                                <button onClick={() => handleDelete(app.id)} className="text-red-400 hover:underline text-sm">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {apps.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">No apps found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="mt-4 flex gap-2">
                                {apps.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
