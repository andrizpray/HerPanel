import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ ftpUsers, domains }) {
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Are you sure you want to delete this FTP user?')) {
            destroy(route('ftp.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-200 leading-tight">FTP Management</h2>}
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-300">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-medium">FTP Users</h3>
                                <Link
                                    href={route('ftp.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create FTP User
                                </Link>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="py-2">Username</th>
                                        <th>Domain</th>
                                        <th>Quota (MB)</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ftpUsers.data.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-700">
                                            <td className="py-2">{user.username}</td>
                                            <td>{user.domain ? user.domain.domain_name : 'N/A'}</td>
                                            <td>{user.quota_mb === 0 ? 'Unlimited' : user.quota_mb}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={route('ftp.edit', user.id)} className="text-blue-400 hover:underline mr-2">Edit</Link>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {ftpUsers.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">No FTP users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="mt-4 flex gap-2">
                                {ftpUsers.links.map((link, index) => (
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
