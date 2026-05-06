import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        command: '',
        schedule: '',
    });

    const predefinedSchedules = [
        { value: '* * * * *', label: 'Every minute' },
        { value: '0 * * * *', label: 'Hourly' },
        { value: '0 0 * * *', label: 'Daily (midnight)' },
        { value: '0 0 * * 0', label: 'Weekly (Sunday midnight)' },
        { value: '0 0 1 * *', label: 'Monthly (1st day)' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cron-jobs.store'));
    };

    return (
        <AuthenticatedLayout>
            <div className="px-4 sm:px-6 py-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href={route('cron-jobs.index')}
                            className="text-hpText2 hover:text-hpText transition-colors"
                        >
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-hpText">Create Cron Job</h1>
                    </div>

                    <div className="bg-hpBg2 border border-hpBorder rounded-xl p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none"
                                    placeholder="e.g., Backup Database"
                                />
                                {errors.name && <p className="text-hpDanger text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Command</label>
                                <textarea
                                    value={data.command}
                                    onChange={(e) => setData('command', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none font-mono text-sm"
                                    placeholder="e.g., /usr/bin/php /var/www/herpanel/artisan schedule:run"
                                ></textarea>
                                {errors.command && <p className="text-hpDanger text-xs mt-1">{errors.command}</p>}
                                
                                {/* Command Reference */}
                                <div className="mt-3 p-4 bg-hpBg border border-hpBorder rounded-lg">
                                    <h4 className="text-xs font-semibold text-hpText uppercase tracking-wider mb-3">📖 Common Commands Reference</h4>
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">/usr/bin/php /var/www/herpanel/artisan backup:run</div>
                                            <div className="text-hpText3 mt-0.5">Run database backup via Artisan command</div>
                                        </div>
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">/usr/bin/php /var/www/herpanel/artisan cron:process</div>
                                            <div className="text-hpText3 mt-0.5">Process due cron jobs (built-in scheduler)</div>
                                        </div>
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">/usr/bin/php /var/www/herpanel/artisan queue:work --stop-when-empty</div>
                                            <div className="text-hpText3 mt-0.5">Process queued jobs then exit</div>
                                        </div>
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">curl -s https://drizdev.space/health-check -o /dev/null</div>
                                            <div className="text-hpText3 mt-0.5">Ping URL for health monitoring</div>
                                        </div>
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">mysqldump -u user -p'pass' dbname</div>
                                            <div className="text-hpText3 mt-0.5">Direct MySQL dump (redirect output to file)</div>
                                        </div>
                                        <div>
                                            <div className="text-hpAccent font-mono font-medium">/usr/bin/php /var/www/herpanel/artisan migrate --force</div>
                                            <div className="text-hpText3 mt-0.5">Run database migrations (production)</div>
                                        </div>
                                        <div className="pt-2 border-t border-hpBorder">
                                            <div className="text-hpText3 italic">💡 Tip: Commands run as user <code className="text-hpText2">www-data</code> in shell context. Use full paths for binaries.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-hpText2 mb-2">Schedule</label>
                                <select
                                    value={data.schedule}
                                    onChange={(e) => setData('schedule', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none mb-2"
                                >
                                    <option value="">Select a predefined schedule</option>
                                    {predefinedSchedules.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={data.schedule}
                                    onChange={(e) => setData('schedule', e.target.value)}
                                    className="w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-lg text-hpText focus:border-hpAccent focus:outline-none font-mono text-sm"
                                    placeholder="Or enter custom cron expression (e.g., * * * * *)"
                                />
                                {errors.schedule && <p className="text-hpDanger text-xs mt-1">{errors.schedule}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    href={route('cron-jobs.index')}
                                    className="px-4 py-2 text-sm font-medium text-hpText2 hover:text-hpText transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-hpAccent hover:bg-hpAccent2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Cron Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
