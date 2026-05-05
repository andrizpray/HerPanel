import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ domains, flash }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this domain?')) {
            router.delete(route('domains.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Domains</h2>}
        >
            <Head title="Domains" />

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
                                    href={route('domains.create')}
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    Add Domain
                                </Link>
                            </div>

                            {domains.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No domains yet.</p>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="py-2">Domain</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {domains.map((domain) => (
                                            <tr key={domain.id} className="border-b dark:border-gray-700">
                                                <td className="py-2">{domain.domain_name}</td>
                                                <td className="py-2">
                                                    <span className={`rounded px-2 py-1 text-xs ${
                                                        domain.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                    }`}>
                                                        {domain.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <button
                                                        onClick={() => handleDelete(domain.id)}
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
