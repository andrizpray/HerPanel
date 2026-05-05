import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Index({ items, currentPath, flash }) {
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef(null);
    
    // New features state
    const [previewItem, setPreviewItem] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    
    const [renameItem, setRenameItem] = useState(null);
    const [renameName, setRenameName] = useState('');
    
    const [permsItem, setPermsItem] = useState(null);
    const [permsData, setPermsData] = useState(null);
    const [newPerms, setNewPerms] = useState('');
    
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

    // Preview handler
    const handlePreview = (item) => {
        setPreviewItem(item);
        setPreviewData(null);
        setPreviewLoading(true);
        
        fetch(route('file-manager.preview', { item_path: item.path }))
            .then(res => res.json())
            .then(data => {
                setPreviewData(data);
                setPreviewLoading(false);
            })
            .catch(() => {
                setPreviewData({ error: 'Failed to load preview' });
                setPreviewLoading(false);
            });
    };

    // Rename handler
    const handleRename = (item) => {
        setRenameItem(item);
        setRenameName(item.name);
    };

    const submitRename = () => {
        if (!renameName.trim()) return;
        
        router.post(route('file-manager.rename'), {
            item_path: renameItem.path,
            new_name: renameName.trim(),
        }, {
            onSuccess: () => {
                setRenameItem(null);
                setRenameName('');
            }
        });
    };

    // Permissions handler
    const handlePermissions = (item) => {
        setPermsItem(item);
        setPermsData(null);
        setNewPerms('');
        
        fetch(route('file-manager.permissions', { item_path: item.path }))
            .then(res => res.json())
            .then(data => {
                setPermsData(data);
                setNewPerms(data.octal);
            });
    };

    const submitPermissions = () => {
        router.post(route('file-manager.permissions.update'), {
            item_path: permsItem.path,
            permissions: newPerms,
        }, {
            onSuccess: () => {
                setPermsItem(null);
            }
        });
    };

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-hpBorder gap-3 sm:gap-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-[12px] flex-wrap">
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
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder w-48">Actions</th>
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
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRename(item); }}
                                                className="px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePermissions(item); }}
                                                className="px-2.5 py-1 rounded-md bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-400 hover:bg-purple-500/10 transition-all"
                                            >
                                                Perms
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                                className="px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                                className="text-[13px] text-white font-medium hover:text-hpAccent2 transition-colors text-left"
                                            >
                                                {item.name}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[11px] text-hpAccent2 uppercase tracking-wider font-medium">File</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-[12px] text-hpText2 font-mono">{formatBytes(item.size)}</td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/30 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                                className="px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                            >
                                                Preview
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRename(item); }}
                                                className="px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePermissions(item); }}
                                                className="px-2.5 py-1 rounded-md bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-400 hover:bg-purple-500/10 transition-all"
                                            >
                                                Perms
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.path, item.name); }}
                                                className="px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setPreviewItem(null); setPreviewData(null); }}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium truncate flex-1">Preview: {previewItem.name}</span>
                            <button onClick={() => { setPreviewItem(null); setPreviewData(null); }} className="text-hpText3 hover:text-white transition-colors ml-4">×</button>
                        </div>
                        <div className="p-5 overflow-auto max-h-[calc(80vh-60px)]">
                            {previewLoading && (
                                <div className="text-center py-12 text-hpText2">Loading preview...</div>
                            )}
                            {previewData?.error && (
                                <div className="text-center py-12 text-red-400 text-[13px]">{previewData.error}</div>
                            )}
                            {previewData?.type === 'text' && (
                                <pre className="bg-hpBg border border-hpBorder rounded-lg p-4 text-[12px] text-hpText2 overflow-x-auto whitespace-pre-wrap">{previewData.content}</pre>
                            )}
                            {previewData?.type === 'image' && (
                                <img src={previewData.url} alt={previewItem.name} className="max-w-full h-auto rounded-lg" />
                            )}
                            {previewData?.type === 'pdf' && (
                                <iframe src={previewData.url} className="w-full h-[60vh]" frameBorder="0" />
                            )}
                            {previewData && !previewData.error && !['text', 'image', 'pdf'].includes(previewData.type) && (
                                <div className="text-center py-12 text-hpText2 text-[13px]">Preview not supported for this file type</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {renameItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setRenameItem(null); setRenameName(''); }}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[13px] text-white font-medium mb-4">Rename: {renameItem.name}</h3>
                        <input
                            type="text"
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-hpBg border border-hpBorder rounded-md text-[13px] text-white placeholder-hpText3 outline-none focus:border-hpAccent transition-all mb-4"
                            placeholder="New name..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                        />
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => { setRenameItem(null); setRenameName(''); }}
                                className="px-4 py-2 rounded-md bg-hpBg border border-hpBorder text-hpText2 text-[12px] font-medium hover:bg-hpBg2 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRename}
                                className="px-4 py-2 rounded-md bg-blue-500 text-white text-[12px] font-medium hover:bg-blue-400 transition-all"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permissions Modal */}
            {permsItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setPermsItem(null); setPermsData(null); }}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[13px] text-white font-medium mb-4">Permissions: {permsItem.name}</h3>
                        {!permsData && <div className="text-center py-8 text-hpText2">Loading...</div>}
                        {permsData?.error && <div className="text-center py-8 text-red-400">{permsData.error}</div>}
                        {permsData && !permsData.error && (
                            <>
                                <div className="bg-hpBg border border-hpBorder rounded-lg p-4 mb-4 space-y-2">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-hpText3">Current:</span>
                                        <span className="text-white font-mono">{permsData.permissions} ({permsData.octal})</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                                        {[
                                            { label: 'Owner', read: permsData.owner_read, write: permsData.owner_write, exec: permsData.owner_execute },
                                            { label: 'Group', read: permsData.group_read, write: permsData.group_write, exec: permsData.group_execute },
                                            { label: 'Public', read: permsData.public_read, write: permsData.public_write, exec: permsData.public_execute },
                                        ].map((group, idx) => (
                                            <div key={idx} className="text-center">
                                                <div className="text-hpText3 mb-1.5">{group.label}</div>
                                                <div className="space-y-1">
                                                    <div className={`${group.read ? 'text-emerald-400' : 'text-red-400'}`}>R {group.read ? '✓' : '✗'}</div>
                                                    <div className={`${group.write ? 'text-emerald-400' : 'text-red-400'}`}>W {group.write ? '✓' : '✗'}</div>
                                                    <div className={`${group.exec ? 'text-emerald-400' : 'text-red-400'}`}>X {group.exec ? '✓' : '✗'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[12px] text-hpText3">New permissions:</span>
                                    <input
                                        type="text"
                                        value={newPerms}
                                        onChange={(e) => setNewPerms(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[13px] text-white font-mono outline-none focus:border-purple-500 transition-all"
                                        placeholder="e.g., 755"
                                        maxLength={4}
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => { setPermsItem(null); setPermsData(null); }}
                                        className="px-4 py-2 rounded-md bg-hpBg border border-hpBorder text-hpText2 text-[12px] font-medium hover:bg-hpBg2 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitPermissions}
                                        className="px-4 py-2 rounded-md bg-purple-500 text-white text-[12px] font-medium hover:bg-purple-400 transition-all"
                                    >
                                        Update
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
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
