import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Index({ monitoringServerUrl }) {
    const [stats, setStats] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socket = io(monitoringServerUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Connected to monitoring server');
            setConnected(true);
            setError(null);
        });

        socket.on('stats', (data) => {
            setStats(data);
        });

        socket.on('error', (err) => {
            console.error('Monitoring error:', err);
            setError(err.message || 'Failed to get stats');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from monitoring server');
            setConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Cannot connect to monitoring server. Make sure it\'s running.');
            setConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [monitoringServerUrl]);

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">System Monitoring</h2>}
        >
            <Head title="System Monitoring" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Connection Status */}
                    <div className="mb-4 flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {connected ? 'Connected to monitoring server' : 'Disconnected'}
                        </span>
                    </div>

                    {error && (
                        <div className="mb-4 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {!stats ? (
                        <div className="rounded bg-white p-6 shadow-sm dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">Loading system stats...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* CPU Stats */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CPU</h3>
                                </div>
                                <div className="p-6">
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">Usage</span>
                                        <span className="font-mono text-gray-900 dark:text-gray-100">{stats.cpu.usage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-4 rounded-full bg-blue-600 transition-all duration-500"
                                            style={{ width: `${Math.min(stats.cpu.usage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {stats.cpu.model} | {stats.cpu.cores} cores
                                    </p>
                                </div>
                            </div>

                            {/* Memory Stats */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Memory (RAM)</h3>
                                </div>
                                <div className="p-6">
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">Usage</span>
                                        <span className="font-mono text-gray-900 dark:text-gray-100">
                                            {stats.memory.used} GB / {stats.memory.total} GB ({stats.memory.usagePercent}%)
                                        </span>
                                    </div>
                                    <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-4 rounded-full bg-green-600 transition-all duration-500"
                                            style={{ width: `${Math.min(parseFloat(stats.memory.usagePercent), 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Free: {stats.memory.free} GB
                                    </p>
                                </div>
                            </div>

                            {/* Disk Stats */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Disk Usage</h3>
                                </div>
                                <div className="p-6">
                                    {stats.disk.map((disk, idx) => (
                                        <div key={idx} className="mb-4 last:mb-0">
                                            <div className="mb-2 flex justify-between">
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {disk.filesystem} ({disk.mount})
                                                </span>
                                                <span className="font-mono text-gray-900 dark:text-gray-100">
                                                    {disk.used} GB / {disk.size} GB ({disk.usePercent}%)
                                                </span>
                                            </div>
                                            <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className={`h-4 rounded-full transition-all duration-500 ${
                                                        disk.usePercent > 90 ? 'bg-red-600' : 
                                                        disk.usePercent > 70 ? 'bg-yellow-600' : 'bg-blue-600'
                                                    }`}
                                                    style={{ width: `${Math.min(disk.usePercent, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* OS Info */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Info</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">OS:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                                {stats.os.distro} {stats.os.release}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{stats.os.platform}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                                {formatUptime(stats.os.uptime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Network Stats */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Network</h3>
                                </div>
                                <div className="p-6">
                                    {stats.network.map((net, idx) => (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            <span className="text-gray-700 dark:text-gray-300">{net.interface}:</span>
                                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                ↓ {net.rx_bytes} MB / ↑ {net.tx_bytes} MB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Last Updated */}
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
