import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Edit() {
    const { email, errors: pageErrors } = usePage().props;
    const [form, setForm] = useState({ 
        password: '', 
        quota_mb: email.quota_mb || 1024 
    });
    const [errors, setErrors] = useState({});

    const handleUpdate = (e) => {
        e.preventDefault();
        setErrors({});
        
        router.put(`/emails/${email.id}`, form, {
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AuthenticatedLayout header="Edit Email">
            <Head title={`Edit ${email.email}`} />
            
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Edit: {email.email}</h1>
                <Link 
                    href="/emails"
                    className="px-4 py-2 bg-[#242836] hover:bg-[#2a2e3b] text-[#94a3b8] rounded-lg transition-colors"
                >
                    Back
                </Link>
            </div>

            <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3b] p-6 max-w-2xl">
                <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                        <label className="block text-[#94a3b8] mb-2">Email Address</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-[#64748b] cursor-not-allowed"
                            value={email.email} 
                            disabled 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[#94a3b8] mb-2">
                            New Password (leave blank to keep current)
                        </label>
                        <input 
                            type="password" 
                            className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-white placeholder-[#64748b] focus:border-indigo-500 focus:outline-none"
                            placeholder="Enter new password" 
                            value={form.password} 
                            onChange={(e) => setForm({...form, password: e.target.value})}
                        />
                        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        {pageErrors.password && <p className="text-red-400 text-sm mt-1">{pageErrors.password}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-[#94a3b8] mb-2">Quota (MB)</label>
                        <input 
                            type="number" 
                            className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                            value={form.quota_mb} 
                            onChange={(e) => setForm({...form, quota_mb: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button 
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                        >
                            Update
                        </button>
                        <Link 
                            href="/emails"
                            className="flex-1 text-center bg-[#242836] hover:bg-[#2a2e3b] text-[#94a3b8] py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
