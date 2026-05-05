import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ items, currentPath, flash }) {
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        folder_name: '',
        path: currentPath,
    });

    const { data: uploadData, setData: setUploadData, post: uploadPost, processing: uploadProcessing, errors: uploadErrors, reset: uploadReset } = useForm({
        file: null,
        path: currentPath,
    });

    const handleMkdir = (e) => {
        e.preventDefault();
        post(route('file-manager.mkdir'), {
            onSuccess: () => {
                reset();
                setShowCreateFolder(false);
            }
        });
    };

    const handleUpload = (e) => {
        e.preventDefault();
        uploadPost(route('file-manager.upload'), {
            onSuccess: () => uploadReset(),
        });
    };

    const handleDelete = (itemPath, itemName) => {
        if (confirm(`Delete "${itemName}"?`)) {
            router.delete(route('file-manager.delete'), {
                data: { item_path: itemPath }
            });
        }
    };

    const navigateToFolder = (folderPath) => {
        router.get(route('file-manager.index', { path: folderPath }));
    };

    const getParentPath = () => {
        if (!currentPath) return '';
        const parts = currentPath.split('/');
        parts.pop();
        return parts.join('/');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">File Manager</h2>}
        >
            <Head title="File Manager" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded bg-green-100 p-4 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Breadcrumb */}
                            <div className="mb-4 flex items-center gap-2 text-sm">
                                <button
                                    onClick={() => navigateToFolder('')}
                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Root
                                </button>
                                {currentPath && currentPath.split('/').map((part, idx, arr) => {
                                    const path = arr.slice(0, idx + 1).join('/');
                                    return (
                                        <span key={idx}>
                                            <span className="text-gray-400">/</span>
                                            <button
                                                onClick={() => navigateToFolder(path)}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {part}
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="mb-4 flex gap-2">
                                <label className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
                                    Upload File
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            setUploadData('file', e.target.files[0]);
                                            setTimeout(() => handleUpload(e), 100);
                                        }}
                                    />
                                </label>
                                <button
                                    onClick={() => setShowCreateFolder(!showCreateFolder)}
                                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    New Folder
                                </button>
                            </div>

                            {/* Create Folder Form */}
                            {showCreateFolder && (
                                <form onSubmit={handleMkdir} className="mb-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={data.folder_name}
                                        onChange={(e) => setData('folder_name', e.target.value)}
                                        placeholder="Folder name"
                                        className="rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                    {errors.folder_name && (
                                        <p className="text-sm text-red-600">{errors.folder_name}</p>
                                    )}
                                </form>
                            )}

                            {/* File List */}
                            {items.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Empty folder.</p>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2">Size</th>
                                            <th className="py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPath && (
                                            <tr className="border-b dark:border-gray-700">
                                                <td colSpan="4">
                                                    <button
                                                        onClick={() => navigateToFolder(getParentPath())}
                                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        .. (Parent)
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="border-b dark:border-gray-700">
                                                <td className="py-2">
                                                    {item.type === 'dir' ? (
                                                        <button
                                                            onClick={() => navigateToFolder(item.path)}
                                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                                        >
                                                            📁 {item.name}
                                                        </button>
                                                    ) : (
                                                        <span>📄 {item.name}</span>
                                                    )}
                                                </td>
                                                <td className="py-2">{item.type === 'dir' ? 'Folder' : 'File'}</td>
                                                <td className="py-2">{item.type === 'file' ? formatBytes(item.size) : '-'}</td>
                                                <td className="py-2">
                                                    <button
                                                        onClick={() => handleDelete(item.path, item.name)}
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

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
