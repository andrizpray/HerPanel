import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ databases, flash }) {
    const handleDelete = (id, dbName) => {
        if (confirm(`Delete database "${dbName}"? This action cannot be undone.`)) {
            router.delete(route('databases.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Databases</h2>}
        >
            <Head title="Databases" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded bg-green-100 p-4 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-4 flex justify-end">
                                <Link
                                    href={route('databases.create')}
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    Create Database
                                </Link>
                            </div>

                            {databases.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No databases yet.</p>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="py-2">Database Name</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {databases.map((db) => (
                                            <tr key={db.id} className="border-b dark:border-gray-700">
                                                <td className="py-2 font-mono">{db.db_name}</td>
                                                <td className="py-2">
                                                    <span className={`rounded px-2 py-1 text-xs ${
                                                        db.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                    }`}>
                                                        {db.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <button
                                                        onClick={() => handleDelete(db.id, db.db_name)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
