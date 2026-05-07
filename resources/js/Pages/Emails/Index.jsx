import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Index() {
    const { emails, domains } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({ domain_id: '', prefix: '', password: '', quota_mb: 1024 });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        setErrors({});
        
        router.post('/emails', form, {
            onSuccess: () => { 
                setShowCreateModal(false); 
                setForm({ domain_id: '', prefix: '', password: '', quota_mb: 1024 }); 
            },
            onError: (errors) => setErrors(errors),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this email account?')) {
            router.delete(`/emails/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header="Email Accounts">
            <Head title="Email Accounts" />
            
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Email Accounts</h1>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Add Email
                </button>
            </div>

            <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3b] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#2a2e3b]">
                            <th className="text-left p-4 text-[#94a3b8] font-medium">Email</th>
                            <th className="text-left p-4 text-[#94a3b8] font-medium">Domain</th>
                            <th className="text-left p-4 text-[#94a3b8] font-medium">Quota (MB)</th>
                            <th className="text-left p-4 text-[#94a3b8] font-medium">Created</th>
                            <th className="text-right p-4 text-[#94a3b8] font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emails && emails.map((email) => (
                            <tr key={email.id} className="border-b border-[#2a2e3b] hover:bg-[#242836] transition-colors">
                                <td className="p-4 text-white">{email.email}</td>
                                <td className="p-4 text-[#94a3b8]">{email.domain_name}</td>
                                <td className="p-4 text-[#94a3b8]">{email.quota_mb}</td>
                                <td className="p-4 text-[#64748b]">
                                    {new Date(email.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Link 
                                        href={`/emails/${email.id}/edit`}
                                        className="px-3 py-1.5 bg-[#242836] hover:bg-[#2a2e3b] text-[#94a3b8] rounded-lg text-sm transition-colors inline-block"
                                    >
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(email.id)}
                                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!emails || emails.length === 0) && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-[#64748b]">
                                    No email accounts found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3b] p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-4">Create Email Account</h2>
                        
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-[#94a3b8] mb-2">Domain</label>
                                <select 
                                    className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    value={form.domain_id} 
                                    onChange={(e) => setForm({...form, domain_id: e.target.value})}
                                >
                                    <option value="">Select Domain</option>
                                    {domains.map((d) => (
                                        <option key={d.id} value={d.id}>{d.domain_name}</option>
                                    ))}
                                </select>
                                {errors.domain_id && <p className="text-red-400 text-sm mt-1">{errors.domain_id}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[#94a3b8] mb-2">Email Prefix</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-white placeholder-[#64748b] focus:border-indigo-500 focus:outline-none"
                                    placeholder="e.g., info" 
                                    value={form.prefix} 
                                    onChange={(e) => setForm({...form, prefix: e.target.value})}
                                />
                                {errors.prefix && <p className="text-red-400 text-sm mt-1">{errors.prefix}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[#94a3b8] mb-2">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 pr-10 text-white placeholder-[#64748b] focus:border-indigo-500 focus:outline-none"
                                        placeholder="Enter password" 
                                        value={form.password} 
                                        onChange={(e) => setForm({...form, password: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-[#94a3b8] mb-2">Quota (MB)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-white placeholder-[#64748b] focus:border-indigo-500 focus:outline-none"
                                    value={form.quota_mb} 
                                    onChange={(e) => setForm({...form, quota_mb: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                                >
                                    Create
                                </button>
                                <button 
                                    type="button"
                                    className="flex-1 bg-[#242836] hover:bg-[#2a2e3b] text-[#94a3b8] py-2 rounded-lg transition-colors"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
