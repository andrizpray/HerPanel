import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ domain, errorCodes }) {
    const [form, setForm] = useState({
        error_code: '404',
        content: `<!DOCTYPE html>
<html>
<head>
    <title>Error 404 - Page Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f4f4f4; }
        h1 { color: #333; font-size: 50px; margin-bottom: 20px; }
        p { color: #666; font-size: 18px; }
        a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404</h1>
    <p>The page you are looking for could not be found.</p>
    <p><a href="/">Go back to homepage</a></p>
</body>
</html>`,
        is_active: true,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route('error-pages.store', domain.id), form, {
            onFinish: () => setLoading(false),
        });
    };

    const selectedCode = errorCodes.find(c => c.code === form.error_code);

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <Link href={route('error-pages.index', domain.id)} className="text-hpText3 hover:text-white transition-colors">
                        ← Error Pages
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Create Error Page: {domain.domain_name}
                </span>
            }
        >
            <Head title={`Create Error Page: ${domain.domain_name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Code */}
                        <div>
                            <label className="text-[11px] text-hpText3 uppercase tracking-wider mb-1.5 block">Error Code</label>
                            <select
                                value={form.error_code}
                                onChange={(e) => setForm({...form, error_code: e.target.value})}
                                className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                                required
                            >
                                {errorCodes.map((code) => (
                                    <option key={code.code} value={code.code}>
                                        {code.code} - {code.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Preview Selected Code */}
                        {selectedCode && (
                            <div className="bg-hpBg border border-hpBorder rounded-md p-3">
                                <div className="text-[11px] text-hpText3 mb-1">Selected Error:</div>
                                <div className="text-[12px] text-white font-medium">{selectedCode.code} - {selectedCode.name}</div>
                            </div>
                        )}

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
                                Enter the complete HTML content for this error page
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
                                {loading ? 'Saving...' : '+ Create Error Page'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
