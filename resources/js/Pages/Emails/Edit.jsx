import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ emailAccount, flash }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('emails.update', emailAccount.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Change Email Password" />
            
            <div className="p-5 md:p-8">
                <div className="max-w-2xl">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href={route('emails.index')}
                            className="inline-flex items-center gap-1.5 text-[11px] text-hpText3 hover:text-white transition-colors mb-3"
                        >
                            ← Back to Email Accounts
                        </Link>
                        <h1 className="text-[15px] font-semibold text-white">Change Email Password</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Update password for: <span className="text-white font-medium">{emailAccount.email}</span></p>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-lg">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-hpBg2 border border-hpBorder rounded-xl p-5 space-y-4">
                        {/* Email Info */}
                        <div className="bg-hpBg border border-hpBorder rounded-lg p-4 mb-4">
                            <div className="text-[11px] text-hpText3 mb-2">Email Account Information</div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Email Address</span>
                                    <span className="text-white">{emailAccount.email}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Quota</span>
                                    <span className="text-white">{emailAccount.quota_mb} MB</span>
                                </div>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <InputLabel htmlFor="password" value="New Password" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                className="mt-1.5 block w-full"
                                required
                                minLength={8}
                            />
                            {errors.password && (
                                <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-3 pt-3">
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Updating...' : 'Update Password'}
                            </PrimaryButton>
                            <Link
                                href={route('emails.index')}
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
