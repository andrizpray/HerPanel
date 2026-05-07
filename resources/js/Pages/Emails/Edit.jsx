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
    const [showPassword, setShowPassword] = useState(false);

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
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="w-full bg-[#242836] border border-[#2a2e3b] rounded-lg px-4 py-2 pr-10 text-white placeholder-[#64748b] focus:border-indigo-500 focus:outline-none"
                                placeholder="Enter new password" 
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
