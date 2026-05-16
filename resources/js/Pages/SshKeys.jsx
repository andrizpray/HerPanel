import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function SshKeys() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('quick-actions.ssh-keys'));
            const data = await response.json();
            if (data.success) {
                setKeys(data.keys);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    SSH Keys Management
                </span>
            }
        >
            <Head title="SSH Keys" />

            <div className="mb-6 p-5 rounded-lg bg-hpBg2 border border-hpBorder">
                <h2 className="text-base font-semibold text-white mb-2">SSH Public Keys</h2>
                <p className="text-[13px] text-hpText2">Manage SSH keys untuk akses server</p>
            </div>

            {loading ? (
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-5 text-center text-hpText3">Loading SSH keys...</div>
            ) : keys.length === 0 ? (
                <div className="bg-hpBg2 border border-hpBorder rounded-lg p-8 text-center">
                    <div className="text-3xl mb-3 opacity-30">🔑</div>
                    <div className="text-[13px] text-hpText2 font-medium mb-2">No SSH keys found</div>
                    <div className="text-[12px] text-hpText3 mb-4">Tambahkan SSH key di ~/.ssh/ directory</div>
                </div>
            ) : (
                <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="bg-hpBg/50">
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Key Name</th>
                                <th className="text-[11px] text-hpText3 uppercase tracking-wider px-5 py-3 text-left font-medium border-b border-hpBorder">Fingerprint</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key, i) => (
                                <tr key={i} className="hover:bg-hpAccent/3 transition-colors border-b border-hpBorder/50 last:border-0">
                                    <td className="px-5 py-3.5 text-white font-medium">{key.name}</td>
                                    <td className="px-5 py-3.5 font-mono text-hpText3 text-[12px]">{key.fingerprint}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AuthenticatedLayout>
    );
}