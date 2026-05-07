import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({ domains: initialDomains }) {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    const [domains, setDomains] = useState(initialDomains || []);

    useEffect(() => {
        console.log('Dashboard mounted');
        console.log('User:', auth?.user);
        console.log('Domains:', domains);
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{color: 'white', padding: '20px'}}>Loading...</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#0f1117', minHeight: '100vh', color: 'white' }}>
            <Head title="Dashboard" />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>
            <p style={{ marginTop: '10px', color: '#94a3b8' }}>Welcome back, {auth?.user?.name || 'User'}!</p>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1a1d27', borderRadius: '8px' }}>
                <h2 style={{ color: 'white' }}>Your Domains ({domains.length})</h2>
                {domains.length > 0 ? (
                    <ul style={{ marginTop: '10px', color: '#cbd5e1' }}>
                        {domains.map(d => (
                            <li key={d.id} style={{ padding: '5px 0' }}>{d.domain_name}</li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ marginTop: '10px', color: '#64748b' }}>No domains found. <a href="/domains/create" style={{ color: '#818cf8' }}>Add one</a></p>
                )}
            </div>
        </div>
    );
}
