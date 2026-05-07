import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ domain, commonMimeTypes }) {
    const { data, setData, post, processing, errors } = useForm({
        extension: '',
        mime_type: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mime-types.store', domain.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-hpText leading-tight">
                    Add MIME Type - {domain.domain_name}
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-hpCard overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Back Button */}
                            <a
                                href={route('mime-types.index', domain.id)}
                                className="inline-flex items-center gap-2 text-sm text-hpAccent hover:text-hpAccent/80 mb-6"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to MIME Types
                            </a>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Extension */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        File Extension *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.extension}
                                        onChange={(e) => setData('extension', e.target.value.replace(/^\./, ''))}
                                        placeholder="css (without dot)"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent"
                                    />
                                    {errors.extension && (
                                        <p className="mt-1 text-sm text-red-600">{errors.extension}</p>
                                    )}
                                    <p className="mt-1 text-xs text-hpMuted">Enter file extension without the dot (e.g., "css", "js")</p>
                                </div>

                                {/* MIME Type */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        MIME Type *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mime_type}
                                        onChange={(e) => setData('mime_type', e.target.value)}
                                        placeholder="text/css"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent"
                                    />
                                    {errors.mime_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.mime_type}</p>
                                    )}
                                    <div className="mt-2">
                                        <p className="text-xs text-hpMuted mb-2">Common MIME types:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(commonMimeTypes).map(([mime, label]) => (
                                                <button
                                                    key={mime}
                                                    type="button"
                                                    onClick={() => setData('mime_type', mime)}
                                                    className="px-3 py-1 text-xs bg-hpCard2 hover:bg-hpAccent/10 border border-hpBorder rounded-full text-hpText hover:text-hpAccent transition-colors"
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-hpAccent bg-hpBg border-hpBorder rounded focus:ring-hpAccent"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-hpText">
                                        Active (apply this MIME type in Nginx config)
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <a
                                        href={route('mime-types.index', domain.id)}
                                        className="px-4 py-2 bg-hpCard2 hover:bg-hpCard text-hpText rounded-lg text-sm"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-hpAccent hover:bg-hpAccent/90 text-white rounded-lg text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save MIME Type'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
