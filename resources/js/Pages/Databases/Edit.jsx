import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ database, flash }) {
    const { data, setData, put, processing, errors } = useForm({
        db_password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('databases.update', database.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Change Database Password" />
            
            <div className="p-5 md:p-8">
                <div className="max-w-2xl">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href={route('databases.index')}
                            className="inline-flex items-center gap-1.5 text-[11px] text-hpText3 hover:text-white transition-colors mb-3"
                        >
                            ← Back to Databases
                        </Link>
                        <h1 className="text-[15px] font-semibold text-white">Change Database Password</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Update password for database user: <span className="text-white font-medium">{database.db_user}</span></p>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-lg">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-hpBg2 border border-hpBorder rounded-xl p-5 space-y-4">
                        {/* Database Info */}
                        <div className="bg-hpBg border border-hpBorder rounded-lg p-4 mb-4">
                            <div className="text-[11px] text-hpText3 mb-2">Database Information</div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Database Name</span>
                                    <span className="text-white">{database.db_name}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Database User</span>
                                    <span className="text-white">{database.db_user}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Character Set</span>
                                    <span className="text-white">{database.character_set}</span>
                                </div>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">New Password</label>
                            <input
                                type="password"
                                value={data.db_password}
                                onChange={(e) => setData('db_password', e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white placeholder-hpText3 outline-none focus:border-hpAccent"
                                required
                                minLength={8}
                            />
                            {errors.db_password && (
                                <p className="text-[11px] text-red-400 mt-1">{errors.db_password}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-3 pt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-hpAccent text-white rounded-md text-[12px] font-medium hover:bg-hpAccent/90 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                            <Link
                                href={route('databases.index')}
                                className="px-5 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
