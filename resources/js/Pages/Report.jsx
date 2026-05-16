import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Report() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('quick-actions.report'));
            const data = await response.json();
            if (data.success) {
                setReport(data.report);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    System Report
                </span>
            }
        >
            <Head title="System Report" />

            <div className="mb-6 p-5 rounded-lg bg-hpBg2 border border-hpBorder">
                <h2 className="text-base font-semibold text-white mb-2">Server System Report</h2>
                <p className="text-[13px] text-hpText2">Laporan lengkap sistem server</p>
            </div>

            {loading ? (
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5 text-center text-hpText3">Loading report...</div>
            ) : !report ? (
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5 text-center text-hpText3">No report data available</div>
            ) : (
                <div className="space-y-4">
                    {/* System Info */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                        <h3 className="text-[13px] font-medium text-white mb-4">System Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[13px]">
                            <div>
                                <span className="text-hpText3">Hostname:</span>
                                <span className="ml-2 text-white">{report.hostname}</span>
                            </div>
                            <div>
                                <span className="text-hpText3">OS:</span>
                                <span className="ml-2 text-white">{report.os}</span>
                            </div>
                            <div>
                                <span className="text-hpText3">Uptime:</span>
                                <span className="ml-2 text-white">{report.uptime}</span>
                            </div>
                            <div>
                                <span className="text-hpText3">Kernel:</span>
                                <span className="ml-2 text-white">{report.kernel}</span>
                            </div>
                            <div>
                                <span className="text-hpText3">Load Avg:</span>
                                <span className="ml-2 text-white">{report.load_average}</span>
                            </div>
                        </div>
                    </div>

                    {/* CPU & Memory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <h3 className="text-[13px] font-medium text-white mb-4">CPU</h3>
                            <div className="text-[13px] space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-hpText3">Model:</span>
                                    <span className="text-white text-right">{report.cpu.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-hpText3">Cores:</span>
                                    <span className="text-white">{report.cpu.cores}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                            <h3 className="text-[13px] font-medium text-white mb-4">Memory</h3>
                            <div className="text-[13px] space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-hpText3">Total:</span>
                                    <span className="text-white">{formatBytes(report.memory.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-hpText3">Used:</span>
                                    <span className="text-white">{formatBytes(report.memory.used)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-hpText3">Available:</span>
                                    <span className="text-white">{formatBytes(report.memory.available)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disk */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                        <h3 className="text-[13px] font-medium text-white mb-4">Disk Usage</h3>
                        {report.disk.map((d, i) => (
                            <div key={i} className="mb-3 last:mb-0">
                                <div className="flex justify-between text-[12px] mb-1">
                                    <span className="text-hpText2">{d.mountpoint}</span>
                                    <span className="text-hpText3">{d.usage_percent}%</span>
                                </div>
                                <div className="h-2 bg-hpBorder rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-hpAccent rounded-full transition-all" 
                                        style={{ width: `${Math.min(d.usage_percent, 100)}%` }}
                                    />
                                </div>
                                <div className="text-[11px] text-hpText3 mt-1">
                                    {formatBytes(d.used)} / {formatBytes(d.total)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Network */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                        <h3 className="text-[13px] font-medium text-white mb-4">Network Interfaces</h3>
                        <div className="space-y-2">
                            {report.network.map((n, i) => (
                                <div key={i} className="text-[12px] flex items-center justify-between border-b border-hpBorder/50 last:border-0 pb-2 last:pb-0">
                                    <span className="text-white font-medium">{n.interface}</span>
                                    <span className="text-hpText3">{n.rx} / {n.tx}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Services Status */}
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
                        <h3 className="text-[13px] font-medium text-white mb-4">Services Status</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(report.services).map(([name, status]) => (
                                <div key={name} className="flex items-center gap-2 text-[12px]">
                                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <span className="text-hpText2 capitalize">{name.replace(/-/g, ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}