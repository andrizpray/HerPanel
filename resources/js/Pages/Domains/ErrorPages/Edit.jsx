import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ domain, errorPage }) {
    const [form, setForm] = useState({
        content: errorPage.content,
        is_active: errorPage.is_active,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.put(route('error-pages.update', [domain.id, errorPage.id]), form, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <Link href={route('error-pages.index', domain.id)} className="text-hpText3 hover:text-white transition-colors">
                        ← Error Pages
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Edit Error {errorPage.error_code}: {domain.domain_name}
                </span>
            }
        >
            <Head title={`Edit Error ${errorPage.error_code}: ${domain.domain_name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Code Info */}
                        <div className="bg-hpBg border border-hpBorder rounded-md p-3">
                            <div className="text-[11px] text-hpText3 mb-1">Error Code</div>
                            <div className="text-[12px] text-white font-medium">{errorPage.error_code} - Error Page</div>
                        </div>

                        {/* HTML Content */}
                        <div>
                            <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">HTML Content</label>
                            <textarea
                                value={form.content}
                                onChange={(e) => setForm({...form, content: e.target.value})}
                                className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent font-mono"
                                rows="15"
                                required
                            />
                            <div className="text-[11px] text-hpText3 mt-1">
                                Edit the HTML content for this error page
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                className="rounded border-hpBorder bg-hpBg text-hpAccent focus:ring-hpAccent"
                            />
                            <label htmlFor="is_active" className="text-[12px] text-hpText2">Active (apply this error page)</label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-hpBorder">
                            <Link
                                href={route('error-pages.index', domain.id)}
                                className="px-4 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-hpText2 hover:bg-hpBg2 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-orange-500 text-white rounded-md text-[12px] font-medium hover:bg-orange-400 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Update Error Page'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
