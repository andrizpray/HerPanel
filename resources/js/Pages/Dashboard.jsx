import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({ domains: initialDomains }) {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        console.log('Dashboard mounted!');
        setMounted(true);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Dashboard
                </span>
            }
        >
            <Head title="Dashboard" />
            
            <div className={`mb-6 p-5 rounded-lg bg-gray-800 border border-gray-700 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Welcome back, {auth.user.name}!</h2>
                        <p className="text-[13px] text-gray-400 mt-1">Dashboard working! 🎉</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <h3 className="text-white font-medium mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded p-4">
                        <div className="text-[12px] text-gray-400 uppercase">Domains</div>
                        <div className="text-2xl font-semibold text-white mt-1">{initialDomains?.length || 0}</div>
                    </div>
                    <div className="bg-gray-900 rounded p-4">
                        <div className="text-[12px] text-gray-400 uppercase">Status</div>
                        <div className="text-2xl font-semibold text-emerald-400 mt-1">✓ Online</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
