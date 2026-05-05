import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        db_name: '',
        db_user: '',
        db_password: '',
    });

    const handleSubmit = (e) => { e.preventDefault(); post(route('databases.store')); };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        let pass = '';
        for (let i = 0; i < 20; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setData('db_password', pass);
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Create Database
                </span>
            }
        >
            <Head title="Create Database" />

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Database Configuration</span>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <div>
                                <label className="block text-[12px] text-hpText2 mb-2 font-medium">Database Name</label>
                                <input
                                    type="text"
                                    value={data.db_name}
                                    onChange={(e) => setData('db_name', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-hpBg border rounded-md text-[13px] text-white placeholder-hpText3 outline-none transition-colors font-mono
                                        ${errors.db_name ? 'border-red-500' : 'border-hpBorder focus:border-hpAccent'}`}
                                    placeholder="herpanel_app"
                                />
                                {errors.db_name && <p className="mt-2 text-[12px] text-red-400">{errors.db_name}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] text-hpText2 mb-2 font-medium">Database Username</label>
                                <input
                                    type="text"
                                    value={data.db_user}
                                    onChange={(e) => setData('db_user', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-hpBg border rounded-md text-[13px] text-white placeholder-hpText3 outline-none transition-colors font-mono
                                        ${errors.db_user ? 'border-red-500' : 'border-hpBorder focus:border-hpAccent'}`}
                                    placeholder="herpanel_user"
                                />
                                {errors.db_user && <p className="mt-2 text-[12px] text-red-400">{errors.db_user}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] text-hpText2 mb-2 font-medium">Password</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.db_password}
                                        onChange={(e) => setData('db_password', e.target.value)}
                                        className={`flex-1 px-4 py-2.5 bg-hpBg border rounded-md text-[13px] text-white placeholder-hpText3 outline-none transition-colors font-mono
                                            ${errors.db_password ? 'border-red-500' : 'border-hpBorder focus:border-hpAccent'}`}
                                        placeholder="Strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-2.5 rounded-md bg-hpBg border border-hpBorder text-[11px] text-hpText2 hover:border-hpAccent hover:text-hpAccent2 transition-colors whitespace-nowrap"
                                    >
                                        Generate
                                    </button>
                                </div>
                                {errors.db_password && <p className="mt-2 text-[12px] text-red-400">{errors.db_password}</p>}
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-purple-500 text-white px-5 py-2 rounded-md text-[12px] font-medium hover:bg-purple-400 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Creating...' : '+ Create Database'}
                                </button>
                                <Link
                                    href={route('databases.index')}
                                    className="flex items-center gap-2 bg-hpBg border border-hpBorder text-hpText2 px-5 py-2 rounded-md text-[12px] font-medium hover:border-hpBorder2 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Connection Info</span>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Host</span>
                                <span className="text-[12px] text-white font-mono">localhost</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Port</span>
                                <span className="text-[12px] text-white font-mono">3306</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Engine</span>
                                <span className="text-[12px] text-white font-mono">MySQL 8.x</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Charset</span>
                                <span className="text-[12px] text-white font-mono">utf8mb4</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Collation</span>
                                <span className="text-[12px] text-white font-mono">utf8mb4_unicode_ci</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden mt-4">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Security Tips</span>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="text-[11px] text-hpText3 leading-relaxed">
                                <span className="text-emerald-400">✓</span> Use auto-generated passwords for maximum security
                            </div>
                            <div className="text-[11px] text-hpText3 leading-relaxed">
                                <span className="text-emerald-400">✓</span> Database users are restricted to localhost access only
                            </div>
                            <div className="text-[11px] text-hpText3 leading-relaxed">
                                <span className="text-emerald-400">✓</span> Store credentials in your app's .env file
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
