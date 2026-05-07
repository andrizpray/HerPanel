import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ domain, redirect }) {
    const { data, setData, put, processing, errors } = useForm({
        source_path: redirect.source_path,
        destination_url: redirect.destination_url,
        redirect_type: redirect.redirect_type,
        is_active: redirect.is_active,
        priority: redirect.priority,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('redirects.update', [domain.id, redirect.id]));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-hpText leading-tight">
                    Edit Redirect Rule - {domain.domain_name}
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-hpCard overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Back Button */}
                            <a
                                href={route('redirects.index', domain.id)}
                                className="inline-flex items-center gap-2 text-sm text-hpAccent hover:text-hpAccent/80 mb-6"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Redirect Rules
                            </a>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Source Path */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Source Path *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.source_path}
                                        onChange={(e) => setData('source_path', e.target.value)}
                                        placeholder="/old-page"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent font-mono text-sm"
                                    />
                                    {errors.source_path && (
                                        <p className="mt-1 text-sm text-red-600">{errors.source_path}</p>
                                    )}
                                </div>

                                {/* Destination URL */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Destination URL *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.destination_url}
                                        onChange={(e) => setData('destination_url', e.target.value)}
                                        placeholder="https://example.com/new-page"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent font-mono text-sm"
                                    />
                                    {errors.destination_url && (
                                        <p className="mt-1 text-sm text-red-600">{errors.destination_url}</p>
                                    )}
                                </div>

                                {/* Redirect Type */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Redirect Type *
                                    </label>
                                    <select
                                        value={data.redirect_type}
                                        onChange={(e) => setData('redirect_type', e.target.value)}
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent"
                                    >
                                        <option value="301">301 - Permanent</option>
                                        <option value="302">302 - Temporary</option>
                                        <option value="307">307 - Temporary (Preserve Method)</option>
                                        <option value="308">308 - Permanent (Preserve Method)</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-hpText mb-2">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-4 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:outline-none focus:ring-2 focus:ring-hpAccent"
                                    />
                                    {errors.priority && (
                                        <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                                    )}
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
                                        Active (enable this redirect rule)
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <a
                                        href={route('redirects.index', domain.id)}
                                        className="px-4 py-2 bg-hpCard2 hover:bg-hpCard text-hpText rounded-lg text-sm"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-hpAccent hover:bg-hpAccent/90 text-white rounded-lg text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Redirect Rule'}
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
