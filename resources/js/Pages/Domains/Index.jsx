import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ domains, flash }) {
    console.log('Domains prop received:', domains);
    console.log('Domains is array?', Array.isArray(domains));
    console.log('Domains length:', domains?.length);

    const [mounted, setMounted] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    // DNS Management
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [showDnsModal, setShowDnsModal] = useState(false);
    const [dnsRecords, setDnsRecords] = useState([]);
    const [dnsForm, setDnsForm] = useState({ type: 'A', name: '@', content: '', ttl: 3600, priority: '' });
    const [loadingDns, setLoadingDns] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); // null = create mode, object = edit mode
    
    // SSL Management
    const [showSslModal, setShowSslModal] = useState(false);
    const [sslDomain, setSslDomain] = useState(null);
    
    // Delete Management
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState(null);
    
    // Mobile Domain Actions
    const [showMobileActions, setShowMobileActions] = useState(false);
    const [mobileActionDomain, setMobileActionDomain] = useState(null);
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDelete = (domain) => {
        setDomainToDelete(domain);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (domainToDelete) {
            router.delete(route('domains.destroy', domainToDelete.id), {
                onFinish: () => {
                    setShowDeleteModal(false);
                    setDomainToDelete(null);
                }
            });
        }
    };

    // DNS Handlers
    const openDnsModal = (domain) => {
        setSelectedDomain(domain);
        setShowDnsModal(true);
        fetchDnsRecords(domain.id);
    };

    const fetchDnsRecords = (domainId) => {
        setLoadingDns(true);
        fetch(route('domains.dns.index', domainId))
            .then(res => res.json())
            .then(data => {
                setDnsRecords(data.records || []);
                setLoadingDns(false);
            })
            .catch(() => setLoadingDns(false));
    };

    const handleDnsSubmit = (e) => {
        e.preventDefault();
        
        if (editingRecord) {
            // Update existing record
            router.put(route('domains.dns.update', [selectedDomain.id, editingRecord.id]), dnsForm, {
                onSuccess: () => {
                    setDnsForm({ type: 'A', name: '@', content: '', ttl: 3600, priority: '' });
                    setEditingRecord(null);
                    fetchDnsRecords(selectedDomain.id);
                }
            });
        } else {
            // Create new record
            router.post(route('domains.dns.store', selectedDomain.id), dnsForm, {
                onSuccess: () => {
                    setDnsForm({ type: 'A', name: '@', content: '', ttl: 3600, priority: '' });
                    fetchDnsRecords(selectedDomain.id);
                }
            });
        }
    };

    const handleDnsEdit = (record) => {
        setEditingRecord(record);
        setDnsForm({
            type: record.type,
            name: record.name,
            content: record.content,
            ttl: record.ttl,
            priority: record.priority || ''
        });
    };

    const handleDnsDelete = (recordId) => {
        if (confirm('Delete this DNS record?')) {
            router.delete(route('domains.dns.destroy', [selectedDomain.id, recordId]), {
                onSuccess: () => fetchDnsRecords(selectedDomain.id)
            });
        }
    };

    // Mobile Domain Actions
    const openMobileActions = (domain) => {
        setMobileActionDomain(domain);
        setShowMobileActions(true);
    };

    const closeMobileActions = () => {
        setShowMobileActions(false);
        setMobileActionDomain(null);
    };

    
    const handleMobileDns = () => {
        setShowMobileActions(false);
        openDnsModal(mobileActionDomain);
    };
    
    const handleMobileSsl = () => {
        setShowMobileActions(false);
        openSslModal(mobileActionDomain);
    };
    
    const handleMobileDelete = () => {
        setShowMobileActions(false);
        if (mobileActionDomain) {
            handleDelete(mobileActionDomain);
        }
    };
    
    // SSL Handlers
    const openSslModal = (domain) => {
        setSslDomain(domain);
        setShowSslModal(true);
    };

    const handleSslCheck = () => {
        router.post(route('domains.ssl.check', sslDomain.id), {}, {
            onSuccess: () => {
                setShowSslModal(false);
                // Reload page to refresh domain status
                window.location.reload();
            }
        });
    };

    const handlePhpVersionChange = (domainId, phpVersion) => {
        router.post(route('domains.php-version', domainId), { php_version: phpVersion });
    };

    const getSslStatusColor = (status) => {
        switch(status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-hpBg border-hpBorder text-hpText2';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Domain Management
                </span>
            }
        >
            <Head title="Domains" />

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Total Domains</div>
                    <div className="text-2xl font-semibold text-white tabular-nums">{domains.length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">Active</div>
                    <div className="text-2xl font-semibold text-emerald-400 tabular-nums">{domains.filter(d => d.status === 'active').length}</div>
                </div>
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-4">
                    <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-1">With SSL</div>
                    <div className="text-2xl font-semibold text-blue-400 tabular-nums">{domains.filter(d => d.ssl_status === 'active').length}</div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                        ✗ {flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-white font-medium">Your Domains</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-hpBg text-hpText3 border border-hpBorder">
                            {domains.length} total
                        </span>
                    </div>
                    <Link
                        href={route('domains.create')}
                        className="flex items-center gap-2 bg-hpAccent/10 border border-hpAccent/30 text-hpAccent2 text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/20 transition-colors"
                    >
                        + Add Domain
                    </Link>
                </div>

                {domains.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-3xl mb-3 opacity-30">◎</div>
                        <div className="text-[13px] text-hpText2 font-medium mb-2">No domains yet</div>
                        <div className="text-[12px] text-hpText3 mb-4">Get started by adding your first domain</div>
                        <Link
                            href={route('domains.create')}
                            className="inline-flex items-center gap-2 bg-hpAccent text-white text-[12px] px-4 py-2 rounded-md font-medium hover:bg-hpAccent/90 transition-colors"
                        >
                            + Add Your First Domain
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Domain Name</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Status</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">SSL</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">PHP Version</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-left font-medium border-b border-hpBorder">Registered</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-2.5 text-right font-medium border-b border-hpBorder">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((domain) => (
                                <tr
                                    key={domain.id}
                                    className={`transition-colors ${hoveredRow === domain.id ? 'bg-hpAccent/3' : ''}`}
                                    onMouseEnter={() => setHoveredRow(domain.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => isMobile ? openMobileActions(domain) : null}
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-hpBg border border-hpBorder flex items-center justify-center text-hpAccent2 text-[10px] font-semibold">
                                                {domain.domain_name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="text-[13px] text-white font-medium">{domain.domain_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium
                                            ${domain.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${domain.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {domain.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getSslStatusColor(domain.ssl_status)}`}>
                                            {domain.ssl_status === 'active' && <span>🔒</span>}
                                            {(domain.ssl_status || 'none').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50">
                                        <select
                                            value={domain.php_version || '8.3'}
                                            onChange={(e) => handlePhpVersionChange(domain.id, e.target.value)}
                                            className="px-2 py-1 bg-hpBg2 border border-hpBorder rounded text-[11px] text-white outline-none focus:border-hpAccent"
                                        >
                                            <option value="8.1">PHP 8.1</option>
                                            <option value="8.2">PHP 8.2</option>
                                            <option value="8.3">PHP 8.3</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-[12px] text-hpText2">
                                        {new Date(domain.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3.5 border-b border-hpBorder/50 text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <button
                                                onClick={() => openDnsModal(domain)}
                                                className="px-3 py-1.5 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                            >
                                                DNS ({domain.dns_records?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => openSslModal(domain)}
                                                className={`px-3 py-1.5 rounded-md text-[11px] border transition-all
                                                    ${domain.ssl_status === 'active' 
                                                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' 
                                                        : 'bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/10'}`}
                                            >
                                                SSL
                                            </button>
                                            <Link
                                                href={route('domains.subdomains.index', domain.id)}
                                                className="px-3 py-1.5 rounded-md bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-400 hover:bg-purple-500/10 transition-all"
                                            >
                                                Subdomains ({domain.subdomains_count || 0})
                                            </Link>
                                            <Link
                                                href={route('error-pages.index', domain.id)}
                                                className="px-3 py-1.5 rounded-md bg-orange-500/5 border border-orange-500/20 text-[11px] text-orange-400 hover:bg-orange-500/10 transition-all"
                                            >
                                                Error Pages
                                            </Link>
                                            <Link
                                                href={route('mime-types.index', domain.id)}
                                                className="px-3 py-1.5 rounded-md bg-teal-500/5 border border-teal-500/20 text-[11px] text-teal-400 hover:bg-teal-500/10 transition-all"
                                            >
                                                MIME Types
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(domain)}
                                                className="px-3 py-1.5 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
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

            {/* DNS Management Modal */}
            {showDnsModal && selectedDomain && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDnsModal(false)}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">DNS Records: {selectedDomain.domain_name}</span>
                            <button onClick={() => setShowDnsModal(false)} className="text-hpText3 hover:text-white transition-colors">×</button>
                        </div>
                        <div className="p-5 overflow-auto max-h-[calc(80vh-60px)]">
                            {/* Add DNS Record Form */}
                                <form onSubmit={handleDnsSubmit} className="bg-hpBg border border-hpBorder rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Type</label>
                                        <select
                                            value={dnsForm.type}
                                            onChange={(e) => setDnsForm({...dnsForm, type: e.target.value})}
                                            className="w-full px-3 py-2 bg-hpBg2 border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                                        >
                                            <option value="A">A</option>
                                            <option value="AAAA">AAAA</option>
                                            <option value="CNAME">CNAME</option>
                                            <option value="MX">MX</option>
                                            <option value="TXT">TXT</option>
                                            <option value="NS">NS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Name</label>
                                        <input
                                            type="text"
                                            value={dnsForm.name}
                                            onChange={(e) => setDnsForm({...dnsForm, name: e.target.value})}
                                            placeholder="@ or subdomain"
                                            className="w-full px-3 py-2 bg-hpBg2 border border-hpBorder rounded-md text-[12px] text-white placeholder-hpText3 outline-none focus:border-hpAccent"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Content</label>
                                    <input
                                        type="text"
                                        value={dnsForm.content}
                                        onChange={(e) => setDnsForm({...dnsForm, content: e.target.value})}
                                        placeholder="IP address or target"
                                        className="w-full px-3 py-2 bg-hpBg2 border border-hpBorder rounded-md text-[12px] text-white placeholder-hpText3 outline-none focus:border-hpAccent"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1">
                                        <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">TTL</label>
                                        <input
                                            type="number"
                                            value={dnsForm.ttl}
                                            onChange={(e) => setDnsForm({...dnsForm, ttl: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 bg-hpBg2 border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                                        />
                                    </div>
                                    {dnsForm.type === 'MX' && (
                                        <div className="flex-1">
                                            <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Priority</label>
                                            <input
                                                type="number"
                                                value={dnsForm.priority}
                                                onChange={(e) => setDnsForm({...dnsForm, priority: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 bg-hpBg2 border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-blue-500 text-white rounded-md text-[12px] font-medium hover:bg-blue-400 transition-all"
                                    >
                                        {editingRecord ? 'Update DNS Record' : '+ Add DNS Record'}
                                    </button>
                                    {editingRecord && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingRecord(null);
                                                setDnsForm({ type: 'A', name: '@', content: '', ttl: 3600, priority: '' });
                                            }}
                                            className="px-4 py-2 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* DNS Records List */}
                            {loadingDns ? (
                                <div className="text-center py-8 text-hpText2 text-[12px]">Loading...</div>
                            ) : dnsRecords.length === 0 ? (
                                <div className="text-center py-8 text-hpText2 text-[12px]">No DNS records yet</div>
                            ) : (
                                <div className="space-y-2">
                                    {dnsRecords.map((record) => (
                                        <div key={record.id} className="bg-hpBg border border-hpBorder rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 bg-hpAccent/10 text-hpAccent2 text-[10px] font-semibold rounded">
                                                    {record.type}
                                                </span>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium">{record.name}</div>
                                                    <div className="text-[11px] text-hpText3 font-mono">{record.content}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDnsEdit(record)}
                                                    className="px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDnsDelete(record.id)}
                                                    className="px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/10 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SSL Management Modal */}
            {showSslModal && sslDomain && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSslModal(false)}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[13px] text-white font-medium mb-4">SSL Certificate: {sslDomain.domain_name}</h3>
                        
                        <div className="bg-hpBg border border-hpBorder rounded-lg p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-[12px]">
                                <span className="text-hpText3">Status:</span>
                                <span className={`font-medium ${sslDomain.ssl_status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {sslDomain.ssl_status?.toUpperCase() || 'NONE'}
                                </span>
                            </div>
                            {sslDomain.ssl_issuer && (
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Issuer:</span>
                                    <span className="text-white">{sslDomain.ssl_issuer}</span>
                                </div>
                            )}
                            {sslDomain.ssl_valid_from && (
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Valid From:</span>
                                    <span className="text-white">{new Date(sslDomain.ssl_valid_from).toLocaleDateString()}</span>
                                </div>
                            )}
                            {sslDomain.ssl_valid_to && (
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Valid To:</span>
                                    <span className="text-white">{new Date(sslDomain.ssl_valid_to).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {sslDomain.ssl_status !== 'active' && (
                            <button
                                onClick={handleSslCheck}
                                className="w-full py-2.5 bg-emerald-500 text-white rounded-md text-[12px] font-medium hover:bg-emerald-400 transition-all mb-3"
                            >
                                🔒 Request SSL Certificate
                            </button>
                        )}

                        <button
                            onClick={() => setShowSslModal(false)}
                            className="w-full py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {/* Mobile Domain Actions Modal */}
            {showMobileActions && mobileActionDomain && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setShowMobileActions(false)}>
                    <div className="bg-hpBg2 border-t border-hpBorder rounded-t-xl w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-2">
                            <span className="text-[13px] text-white font-medium">{mobileActionDomain.domain_name}</span>
                            <p className="text-[11px] text-hpText3 mt-1">Choose action</p>
                        </div>
                        
                        <button
                            onClick={handleMobileDns}
                            className="w-full py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-[12px] font-medium hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            🌐 DNS Records ({mobileActionDomain.dns_records?.length || 0})
                        </button>
                        
                        <button
                            onClick={handleMobileSsl}
                            className={`w-full py-3 border rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-2
                                ${mobileActionDomain.ssl_status === 'active'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'}`}
                        >
                            🔒 SSL Certificate ({mobileActionDomain.ssl_status || 'none'})
                        </button>
                        
                        <button
                            onClick={handleMobileDelete}
                            className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[12px] font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            🗑️ Delete Domain
                        </button>
                        
                        <button
                            onClick={() => setShowMobileActions(false)}
                            className="w-full py-3 bg-hpBg border border-hpBorder text-hpText2 rounded-lg text-[12px] font-medium hover:bg-hpBg2 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && domainToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setDomainToDelete(null); }}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-3">🗑️</div>
                            <h3 className="text-[15px] text-white font-medium mb-2">Delete Domain</h3>
                            <p className="text-[12px] text-hpText2">
                                Are you sure you want to delete domain <span className="text-white font-semibold">"{domainToDelete.domain_name}"</span>?
                            </p>
                            <p className="text-[11px] text-red-400 mt-2">⚠️ This action cannot be undone.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDomainToDelete(null); }}
                                className="flex-1 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-md text-[12px] font-medium hover:bg-red-400 transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
            {/* Mobile Actions Modal */}
            {showMobileActions && mobileActionDomain && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:hidden" onClick={closeMobileActions}>
                    <div className="bg-hpBg2 border border-hpBorder rounded-t-xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] text-white font-medium">{mobileActionDomain.domain_name}</span>
                            <button onClick={closeMobileActions} className="text-hpText3 hover:text-white transition-colors text-lg">×</button>
                        </div>
                        <button
                            onClick={() => { openDnsModal(mobileActionDomain); closeMobileActions(); }}
                            className="w-full px-4 py-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-[12px] text-blue-400 hover:bg-blue-500/10 transition-all text-left"
                        >
                            🌐 DNS Records ({mobileActionDomain.dns_records?.length || 0})
                        </button>
                        <button
                            onClick={() => { openSslModal(mobileActionDomain); closeMobileActions(); }}
                            className={`w-full px-4 py-3 rounded-md text-[12px] border transition-all text-left
                                ${mobileActionDomain.ssl_status === 'active' 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' 
                                    : 'bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/10'}`}
                        >
                            🔒 SSL Certificate
                        </button>
                        <Link
                            href={route('domains.subdomains.index', mobileActionDomain.id)}
                            onClick={closeMobileActions}
                            className="block w-full px-4 py-3 rounded-md bg-purple-500/5 border border-purple-500/20 text-[12px] text-purple-400 hover:bg-purple-500/10 transition-all text-left"
                        >
                            📁 Subdomains ({mobileActionDomain.subdomains_count || 0})
                        </Link>
                        <Link
                            href={route('error-pages.index', mobileActionDomain.id)}
                            onClick={closeMobileActions}
                            className="block w-full px-4 py-3 rounded-md bg-orange-500/5 border border-orange-500/20 text-[12px] text-orange-400 hover:bg-orange-500/10 transition-all text-left"
                        >
                            ⚠️ Error Pages
                        </Link>
                        <Link
                            href={route('mime-types.index', mobileActionDomain.id)}
                            onClick={closeMobileActions}
                            className="block w-full px-4 py-3 rounded-md bg-teal-500/5 border border-teal-500/20 text-[12px] text-teal-400 hover:bg-teal-500/10 transition-all text-left"
                        >
                            📄 MIME Types
                        </Link>
                        <button
                            onClick={() => { handleDelete(mobileActionDomain); closeMobileActions(); }}
                            className="w-full px-4 py-3 rounded-md bg-red-500/5 border border-red-500/20 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                            🗑️ Delete Domain
                        </button>
                    </div>
                </div>
            )}
        
</AuthenticatedLayout>
    );
}
