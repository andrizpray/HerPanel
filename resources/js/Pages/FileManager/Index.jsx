import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Index({ items, currentPath, flash }) {
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        folder_name: '',
        path: currentPath || '',
    });

    const { data: uploadData, setData: setUploadData, post: uploadPost, processing: uploadProcessing, reset: uploadReset } = useForm({
        file: null,
        path: currentPath || '',
    });

    useEffect(() => { setMounted(true); }, []);

    const handleMkdir = (e) => {
        e.preventDefault();
        post(route('file-manager.mkdir'), {
            onSuccess: () => {
                reset();
                setShowCreateFolder(false);
            }
        });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData('file', file);
            setUploadData('path', currentPath || '');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', currentPath || '');
            
            uploadPost(route('file-manager.upload'), {
                data: formData,
                onSuccess: () => {
                    uploadReset();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            });
        }
    };

    const handleDelete = (itemPath, itemName) => {
        if (confirm(`Delete "${itemName}"?\n\nThis action cannot be undone.`)) {
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

    const pathParts = currentPath ? currentPath.split('/') : [];
    const folderCount = items.filter(i => i.type === 'dir').length;
    const fileCount = items.filter(i => i.type === 'file').length;

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    File Manager
                </span>
            }
        >
            <Head title="File Manager" />

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Total Items</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{items.length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Folders</div>
                    <div className="text-2xl font-semibold text-amber-400 tabular-nums">{folderCount}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Files</div>
                    <div className="text-2xl font-semibold text-hpAccent2 tabular-nums">{fileCount}</div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-[12px]">
                        <button
                            onClick={() => navigateToFolder('')}
                            className="px-2 py-1 rounded text-hpText2 hover:text-hpAccent2 hover:bg-hpAccent/5 transition-all font-medium"
                        >
                            Root
                        </button>
                        {pathParts.map((part, idx) => (
                            <span key={idx} className="flex items-center">
                                <span className="text-hpText3 mx-1">/</span>
                                <button
                                    onClick={() => navigateToFolder(pathParts.slice(0, idx + 1).join('/'))}
                                    className={`px-2 py-1 rounded transition-all font-medium ${idx === pathParts.length - 1 ? 'text-hpAccent2 bg-hpAccent/10' : 'text-hpText2 hover:text-hpAccent2 hover:bg-hpAccent/5'}`}
                                >
                                    {part}
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadProcessing}
                            className="flex items-center gap-2 bg-hpBg border border-hpBorder text-hpText2 text-[11px] px-3 py-2 rounded-md font-medium transition-all hover:border-hpAccent hover:text-hpAccent2 disabled:opacity-50"
                        >
                            <span>{uploadProcessing ? '◌' : '↑'}</span>
                            {uploadProcessing ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                            onClick={() => setShowCreateFolder(!showCreateFolder)}
                            className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-md font-medium transition-all ${showCreateFolder ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-hpBg border border-hpBorder text-hpText2 hover:border-amber-500/30 hover:text-amber-400'}`}
                        >
                            <span>{showCreateFolder ? '×' : '+'}</span>
                            New Folder
                        </button>
                    </div>
                </div>

                {/* Create Folder Form */}
                {showCreateFolder && (
                    <form onSubmit={handleMkdir} className="flex items-center gap-3 px-5 py-3 border-b border-hpBorder bg-amber-500/5">
                        <span className="text-amber-400">📁</span>
                        <input
                            type="text"
                            value={data.folder_name}
                            onChange={(e) => setData('folder_name', e.target.value)}
                            placeholder="Enter folder name..."
                            className="flex-1 px-4 py-2 bg-hpBg border border-hpBorder rounded-md text-[13px] text-white placeholder-hpText3 outline-none focus:border-amber-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1 bg-amber-500 text-white px-4 py-2 rounded-md text-[11px] font-medium hover:bg-amber-400 disabled:opacity-50 transition-all"
                        >
                            {processing ? '...' : '✓'} Create
                        </button>
                        {errors.folder_name && (
                            <span className="text-[11px] text-red-400">{errors.folder_name}</span>
                        )}
                    </form>
                )}

                {/* Drop Zone */}
                <div 
                    className={`relative transition-all duration-200 ${dragOver ? 'bg-hpAccent/5' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect({ target: { files: e.dataTransfer.files } }); }}
                >
                    {dragOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-hpAccent/10 border-2 border-dashed border-hpAccent rounded-lg z-10">
                            <span className="text-hpAccent2 text-lg font-semibold">Drop file to upload</span>
                        </div>
                    )}
                </div>

                {/* File List */}
                {items.length === 0 && !showCreateFolder ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4 opacity-30">📂</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">Empty folder</div>
                        <div className="text-[12px] text-hpText3 mb-4">Upload files or create a new folder</div>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 rounded-md text-[12px] font-medium hover:bg-hpAccent/20 transition-all"
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => setShowCreateFolder(true)}
                                className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-[12px] font-medium hover:bg-amber-500/20 transition-all"
                            >
                                New Folder
                            </button>
                        </div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Name</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder w-24">Type</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder w-24">Size</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Parent Directory */}
                            {currentPath && (
                                <tr 
                                    className="hover:bg-hpAccent/3 transition-all cursor-pointer"
                                    onClick={() => navigateToFolder(getParentPath())}
                                >
                                    <td colSpan="4" className="px-5 py-3 border-b border-hpBorder/30">
                                        <div className="flex items-center gap-3 text-hpText2 hover:text-hpAccent2 transition-colors">
                                            <span>↑</span>
                                            <span className="text-[12px] font-medium">.. (Parent Directory)</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            
                            {/* Folders */}
                            {items.filter(item => item.type === 'dir').map((item, idx) => (
                                <tr 
                                    key={idx} 
                                    className={`transition-all cursor-pointer ${hoveredRow === item.path ? 'bg-amber-500/5' : ''}`}
                                    onMouseEnter={() => setHoveredRow(item.path)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => navigateToFolder(item.path)}
                                >
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-amber-400">📁</span>
                                            <span className="text-[13px] text-white font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[11px] text-amber-400 uppercase tracking-wider font-medium">Folder</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[11px] text-hpText3">—</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                            className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Files */}
                            {items.filter(item => item.type === 'file').map((item, idx) => (
                                <tr 
                                    key={idx} 
                                    className={`transition-all ${hoveredRow === item.path ? 'bg-hpAccent/3' : ''}`}
                                    onMouseEnter={() => setHoveredRow(item.path)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-hpAccent2">📄</span>
                                            <span className="text-[13px] text-white font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[11px] text-hpAccent2 uppercase tracking-wider font-medium">File</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[12px] text-hpText2 font-mono">{formatBytes(item.size)}</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                            className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-all"
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
        </AuthenticatedLayout>
    );
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
