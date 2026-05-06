import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ domains, flash, errors: pageErrors }) {
    const { data, setData, post, processing, errors } = useForm({
        domain_id: '',
        email: '',
        password: '',
        quota_mb: 1024,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('emails.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Email Account" />
            
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
                        <h1 className="text-[15px] font-semibold text-white">Create Email Account</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Add a new email address</p>
                    </div>

                    {/* Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded-lg">
                            <div className="font-medium mb-2">Please fix the following errors:</div>
                            {errors.email && <div>• Email: {errors.email}</div>}
                            {errors.password && <div>• Password: {errors.password}</div>}
                            {errors.domain_id && <div>• Domain: {errors.domain_id}</div>}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-hpBg2 border border-hpBorder rounded-xl p-5 space-y-4">
                        {/* Domain */}
                        <div>
                            <InputLabel htmlFor="domain_id" value="Domain" className="text-[11px] uppercase tracking-wider" />
                            <select
                                id="domain_id"
                                value={data.domain_id}
                                onChange={(e) => setData('domain_id', e.target.value)}
                                className="mt-1.5 w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                                required
                            >
                                <option value="">Select a domain</option>
                                {domains.map(domain => (
                                    <option key={domain.id} value={domain.id}>{domain.domain_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Email Prefix */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-[11px] uppercase tracking-wider" />
                            <div className="mt-1.5 flex flex-wrap gap-0">
                                <TextInput
                                    id="email"
                                    type="text"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="username"
                                    className="flex-1 min-w-[120px] rounded-r-none"
                                    required
                                />
                                <span className="inline-flex items-center px-3 bg-hpBg border border-l-0 border-hpBorder rounded-r-md text-[12px] text-hpText2 flex-shrink-0">
                                    @{domains.find(d => String(d.id) === String(data.domain_id))?.domain_name || 'pilih domain'}
                                </span>
                            </div>
                            <p className="text-[11px] text-hpText3 mt-1">Only the part before @ (e.g., "info" for info@example.com)</p>
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimum 8 characters"
                                className="mt-1.5 block w-full"
                                required
                                minLength={8}
                            />
                            {errors.password && (
                                <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Quota */}
                        <div>
                            <InputLabel htmlFor="quota_mb" value="Quota (MB)" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="quota_mb"
                                type="number"
                                value={data.quota_mb}
                                onChange={(e) => setData('quota_mb', e.target.value)}
                                className="mt-1.5 block w-full"
                                required
                                min={100}
                            />
                            <p className="text-[11px] text-hpText3 mt-1">Storage quota in megabytes (1024 MB = 1 GB)</p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-3">
                            <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Creating...' : 'Create Email Account'}
                            </PrimaryButton>
                            <Link
                                href={route('emails.index')}
                                className="block w-full sm:w-auto text-center px-5 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
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
