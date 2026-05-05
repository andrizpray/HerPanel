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

    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (confirm(`⚠️ Delete "${itemName}"?\n\nThis action cannot be undone.`)) {
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

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px] flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                        FILE <span className="text-nexAccent">MANAGER</span>
                    </h1>
                    <p className="page-sub text-[11px] text-nexText2 font-medium mt-2 tracking-[1px]">
                        // Manage your files and folders
                    </p>
                </div>
            }
        >
            <Head title="File Manager" />

            {/* Main Panel */}
            <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-nexBorder bg-nexBg2/30">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-[11px]">
                        <button
                            onClick={() => navigateToFolder('')}
                            className="px-2 py-1 rounded text-nexText2 hover:text-nexAccent hover:bg-nexAccent/5 transition-all font-medium"
                        >
                            Root
                        </button>
                        {pathParts.map((part, idx) => (
                            <span key={idx} className="flex items-center">
                                <span className="text-nexText3 mx-1">/</span>
                                <button
                                    onClick={() => navigateToFolder(pathParts.slice(0, idx + 1).join('/'))}
                                    className={`px-2 py-1 rounded transition-all font-medium ${idx === pathParts.length - 1 ? 'text-nexAccent bg-nexAccent/10' : 'text-nexText2 hover:text-nexAccent hover:bg-nexAccent/5'}`}
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
                            className="flex items-center gap-2 bg-nexBg2 border border-nexBorder text-nexText2 text-[10px] px-3 py-2 rounded-lg cursor-pointer tracking-[1px] font-semibold transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-50"
                        >
                            <span>{uploadProcessing ? '◌' : '↑'}</span>
                            {uploadProcessing ? 'UPLOADING...' : 'UPLOAD'}
                        </button>
                        <button
                            onClick={() => setShowCreateFolder(!showCreateFolder)}
                            className={`flex items-center gap-2 text-[10px] px-3 py-2 rounded-lg tracking-[1px] font-semibold transition-all duration-200 ${showCreateFolder ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-nexBg2 border border-nexBorder text-nexText2 hover:border-emerald-500/50 hover:text-emerald-400'}`}
                        >
                            <span>{showCreateFolder ? '×' : '+'}</span>
                            NEW FOLDER
                        </button>
                    </div>
                </div>

                {/* Create Folder Form */}
                {showCreateFolder && (
                    <form onSubmit={handleMkdir} className="flex items-center gap-3 px-5 py-3 border-b border-nexBorder bg-emerald-500/5">
                        <span className="text-emerald-400 text-sm">📁</span>
                        <input
                            type="text"
                            value={data.folder_name}
                            onChange={(e) => setData('folder_name', e.target.value)}
                            placeholder="Folder name"
                            className="flex-1 px-3 py-2 bg-nexBg2 border border-nexBorder rounded-lg text-[12px] text-white placeholder-nexText3/50 outline-none focus:border-emerald-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1 bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold tracking-[1px] transition-all hover:bg-emerald-400 disabled:opacity-50"
                        >
                            {processing ? '◌' : '✓'} CREATE
                        </button>
                        {errors.folder_name && (
                            <span className="text-[10px] text-red-400">{errors.folder_name}</span>
                        )}
                    </form>
                )}

                {/* Drop Zone */}
                <div 
                    className={`relative transition-all duration-200 ${dragOver ? 'bg-nexAccent/5' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect({ target: { files: e.dataTransfer.files } }); }}
                >
                    {dragOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-nexAccent/10 border-2 border-dashed border-nexAccent rounded-lg z-10">
                            <span className="text-nexAccent text-lg font-bold">Drop file to upload</span>
                        </div>
                    )}
                </div>

                {/* File List */}
                {items.length === 0 && !showCreateFolder ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4 opacity-30">📂</div>
                        <div className="text-[13px] text-nexText2 font-medium mb-2">Empty folder</div>
                        <div className="text-[11px] text-nexText3 mb-4">Upload files or create a new folder</div>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-nexAccent/10 border border-nexAccent/30 text-nexAccent rounded-lg text-[11px] font-semibold hover:bg-nexAccent/20 transition-all"
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => setShowCreateFolder(true)}
                                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-semibold hover:bg-emerald-500/20 transition-all"
                            >
                                New Folder
                            </button>
                        </div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-nexBg2/50">
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder">Name</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder w-24">Type</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-left font-semibold border-b border-nexBorder w-24">Size</th>
                                <th className="text-[10px] tracking-[1px] text-nexText3 uppercase px-5 py-3 text-right font-semibold border-b border-nexBorder w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Parent Directory */}
                            {currentPath && (
                                <tr 
                                    className="hover:bg-nexAccent/5 transition-all cursor-pointer"
                                    onClick={() => navigateToFolder(getParentPath())}
                                >
                                    <td colSpan="4" className="px-5 py-3 border-b border-nexBorder/30">
                                        <div className="flex items-center gap-3 text-nexText2 hover:text-nexAccent transition-colors">
                                            <span className="text-lg">↑</span>
                                            <span className="text-[12px] font-medium">.. (Parent Directory)</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            
                            {/* Folders */}
                            {items.filter(item => item.type === 'dir').map((item, idx) => (
                                <tr 
                                    key={idx} 
                                    className={`transition-all duration-200 cursor-pointer ${hoveredRow === item.path ? 'bg-orange-500/5' : ''}`}
                                    onMouseEnter={() => setHoveredRow(item.path)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => navigateToFolder(item.path)}
                                >
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-orange-400 text-lg">📁</span>
                                            <span className="text-[12px] text-white font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-[10px] text-orange-400 uppercase tracking-wider">Folder</td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-[10px] text-nexText3">—</td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                            className="px-3 py-1 rounded-lg bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Files */}
                            {items.filter(item => item.type === 'file').map((item, idx) => (
                                <tr 
                                    key={idx} 
                                    className={`transition-all duration-200 cursor-pointer ${hoveredRow === item.path ? 'bg-cyan-500/5' : ''}`}
                                    onMouseEnter={() => setHoveredRow(item.path)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-cyan-400 text-lg">📄</span>
                                            <span className="text-[12px] text-white font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-[10px] text-cyan-400 uppercase tracking-wider">File</td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-[11px] text-nexText2 font-mono">{formatBytes(item.size)}</td>
                                    <td className="px-5 py-3.5 border-b border-nexBorder/30 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                            className="px-3 py-1 rounded-lg bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                                        >
                                            DELETE
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
