import React from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ cronJobs }) {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggle = (id) => {
        router.post(route('cron-jobs.toggle', id));
    };

    const handleRunNow = (id) => {
        if (confirm('Run this cron job now?')) {
            router.post(route('cron-jobs.run', id));
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this cron job?')) {
            router.delete(route('cron-jobs.destroy', id));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const truncate = (str, len = 50) => {
        if (str.length <= len) return str;
        return str.substring(0, len) + '...';
    };

    const activeCount = cronJobs.filter(job => job.is_active).length;

    return (
        <AuthenticatedLayout>
            <div className="px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-hpText">Cron Jobs</h1>
                        <p className="text-sm text-hpText2 mt-1">Manage scheduled tasks</p>
                    </div>
                    <Link
                        href={route('cron-jobs.create')}
                        className="px-4 py-2 bg-hpAccent hover:bg-hpAccent2 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Add Cron Job
                    </Link>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                        <div className="text-xs text-hpText2 uppercase tracking-wider">Total Jobs</div>
                        <div className="text-xl font-bold text-hpText mt-1">{cronJobs.length}</div>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                        <div className="text-xs text-hpText2 uppercase tracking-wider">Active</div>
                        <div className="text-xl font-bold text-hpSuccess mt-1">{activeCount}</div>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg px-4 py-3">
                        <div className="text-xs text-hpText2 uppercase tracking-wider">Inactive</div>
                        <div className="text-xl font-bold text-hpWarn mt-1">{cronJobs.length - activeCount}</div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-hpBg2 border border-hpBorder rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className="bg-hpBg3/50 border-b border-hpBorder/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Command</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Schedule</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-hpText2 uppercase tracking-wider">Last Run</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-hpText2 uppercase tracking-wider hidden md:table-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cronJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-8 text-center text-hpText2">
                                            No cron jobs yet. Create your first scheduled task!
                                        </td>
                                    </tr>
                                ) : (
                                    cronJobs.map((job) => (
                                        <tr key={job.id} className="border-b border-hpBorder/50 hover:bg-hpBg3/30 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-hpText">{job.name}</td>
                                            <td className="px-5 py-3.5 text-sm text-hpText2 font-mono text-xs" title={job.command}>
                                                {truncate(job.command, 40)}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-hpText2">{job.schedule}</td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => handleToggle(job.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        job.is_active
                                                            ? 'bg-hpSuccess/10 text-hpSuccess border-hpSuccess/20'
                                                            : 'bg-hpText2/10 text-hpText2 border-hpText2/20'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        job.is_active ? 'bg-hpSuccess' : 'bg-hpText2'
                                                    }`}></span>
                                                    {job.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-hpText2">
                                                {formatDate(job.last_run_at)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right hidden md:table-cell">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRunNow(job.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-hpAccent bg-hpAccent/10 border border-hpAccent/20 rounded-lg hover:bg-hpAccent/20 transition-colors"
                                                    >
                                                        Run Now
                                                    </button>
                                                    <Link
                                                        href={route('cron-jobs.edit', job.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-hpText2 bg-hpBg3/50 border border-hpBorder rounded-lg hover:bg-hpBg3 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(job.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-hpDanger bg-hpDanger/10 border border-hpDanger/20 rounded-lg hover:bg-hpDanger/20 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
