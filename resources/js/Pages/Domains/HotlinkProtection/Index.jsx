import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ domain, protection, allowedDomains, protectedExtensions }) {
    const { data, setData, post, processing, errors } = useForm({
        is_enabled: protection?.is_enabled ?? false,
        allowed_domains: allowedDomains.join('\n'),
        protected_extensions: protectedExtensions.join('\n'),
        redirect_url: protection?.redirect_url ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('hotlink-protection.update', domain.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-hpText leading-tight">
                    Hotlink Protection - {domain.domain_name}
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-hpCard overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Back Button */}
                            <a
                                href={route('domains.index')}
                                className="inline-flex items-center gap-2 text-sm text-hpAccent hover:text-hpAccent/80 mb-6"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Domains
                            </a>

                            {/* Success Message */}
                            {usePage().props.flash?.success && (
                                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                                    {usePage().props.flash.success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Enable/Disable */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_enabled"
                                        checked={data.is_enabled}
                                        onChange={(e) => setData('is_enabled', e.target.checked)}
                                        className="w-4 h-4 text-hpAccent bg-hpBg border-hpBorder rounded focus:ring-hpAccent"
                                    />
                                    <label htmlFor="is_enabled" className="text-sm font-medium text-hpText">
                                        Enable Hotlink Protection
                                    </label>
                                </div>

                                {/* Allowed Domains */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Allowed Domains (one per line)
                                    </label>
                                    <textarea
                                        value={data.allowed_domains}
                                        onChange={(e) => setData('allowed_domains', e.target.value)}
                                        rows={4}
                                        placeholder="example.com&#10;www.example.com&#10;drizdev.space"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent font-mono text-sm"
                                    />
                                    <p className="mt-1 text-xs text-hpMuted">Enter domains that are allowed to hotlink your content</p>
                                </div>

                                {/* Protected Extensions */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Protected File Extensions (one per line)
                                    </label>
                                    <textarea
                                        value={data.protected_extensions}
                                        onChange={(e) => setData('protected_extensions', e.target.value)}
                                        rows={4}
                                        placeholder=".jpg&#10;.png&#10;.gif&#10;.webp&#10;.pdf"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent font-mono text-sm"
                                    />
                                    <p className="mt-1 text-xs text-hpMuted">File extensions to protect from hotlinking</p>
                                </div>

                                {/* Redirect URL */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Redirect URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={data.redirect_url}
                                        onChange={(e) => setData('redirect_url', e.target.value)}
                                        placeholder="https://example.com/warning.png"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent"
                                    />
                                    {errors.redirect_url && (
                                        <p className="mt-1 text-sm text-red-600">{errors.redirect_url}</p>
                                    )}
                                    <p className="mt-1 text-xs text-hpMuted">URL to redirect hotlink requests to (leave empty to return 403 Forbidden)</p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <a
                                        href={route('domains.index')}
                                        className="px-4 py-2 bg-hpCard2 hover:bg-hpCard text-hpText rounded-lg text-sm"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-hpAccent hover:bg-hpAccent/90 text-white rounded-lg text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>

                            {/* Info Box */}
                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                    ℹ️ How Hotlink Protection Works
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    When enabled, Nginx will check the Referer header of incoming requests. 
                                    If the referer is not in the allowed domains list and the file extension matches 
                                    protected extensions, the request will be blocked (403 Forbidden) or redirected 
                                    to the specified URL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
