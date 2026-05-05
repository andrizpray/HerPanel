import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        db_name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('databases.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Create Database</h2>}
        >
            <Head title="Create Database" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-4 rounded bg-blue-100 p-4 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                <p className="text-sm">
                                    Database name will be prefixed with "user_{'{'}your_user_id{'}'}_". 
                                    Only letters, numbers, and underscores are allowed.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Database Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.db_name}
                                        onChange={(e) => setData('db_name', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        placeholder="mydatabase"
                                    />
                                    {errors.db_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.db_name}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Create Database
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
