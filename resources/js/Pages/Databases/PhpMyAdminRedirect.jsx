import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function PhpMyAdminRedirect({ database, phpmyadmin_url }) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const openPhpMyAdmin = () => {
        const url = phpmyadmin_url + 'index.php?db=' + encodeURIComponent(database.db_name);
        window.open(url, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="phpMyAdmin Access" />
            
            <div className="p-5 md:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href={route('databases.index')}
                            className="inline-flex items-center gap-1.5 text-[11px] text-hpText3 hover:text-white transition-colors mb-3"
                        >
                            ← Back to Databases
                        </Link>
                        <h1 className="text-[15px] font-semibold text-white">phpMyAdmin Access</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Manage your database using phpMyAdmin</p>
                    </div>

                    <div className="bg-hpBg2 border border-hpBorder rounded-xl p-5 space-y-5">
                        {/* Database Info */}
                        <div>
                            <div className="text-[11px] text-hpText3 uppercase tracking-wider mb-3">Database Credentials</div>
                            <div className="bg-hpBg border border-hpBorder rounded-lg p-4 space-y-3">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Database Name</span>
                                    <span className="text-white font-medium">{database.db_name}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Database User</span>
                                    <span className="text-white font-medium">{database.db_user}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-hpText3">Character Set</span>
                                    <span className="text-white">{database.character_set}</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                            <div className="text-[12px] text-blue-400 font-medium mb-2">📋 How to Access phpMyAdmin:</div>
                            <ol className="text-[11px] text-hpText2 space-y-1.5 list-decimal list-inside">
                                <li>Click "Open phpMyAdmin" button below</li>
                                <li>phpMyAdmin will open in a new tab</li>
                                <li>Login with the database user credentials above</li>
                                <li>Or use the "Database" field to jump directly to your database</li>
                            </ol>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={openPhpMyAdmin}
                                className="flex-1 py-2.5 bg-blue-500 text-white rounded-md text-[12px] font-medium hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
                            >
                                🚀 Open phpMyAdmin
                            </button>
                            <Link
                                href={route('databases.index')}
                                className="flex-1 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all text-center"
                            >
                                Back to Databases
                            </Link>
                        </div>

                        {/* Direct Link */}
                        <div className="text-center">
                            <p className="text-[11px] text-hpText3">
                                Or access directly at:{' '}
                                <a
                                    href={phpmyadmin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-hpAccent hover:underline"
                                >
                                    {phpmyadmin_url}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
