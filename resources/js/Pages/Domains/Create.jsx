import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({ domain_name: '' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = (e) => { e.preventDefault(); post(route('domains.store')); };

    return (
        <AuthenticatedLayout
            header={
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Add New Domain
                </span>
            }
        >
            <Head title="Add Domain" />

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Domain Configuration</span>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="mb-6">
                                <label className="block text-[12px] text-hpText2 mb-2 font-medium">Domain Name</label>
                                <input
                                    type="text"
                                    value={data.domain_name}
                                    onChange={(e) => setData('domain_name', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-hpBg border rounded-md text-[13px] text-white placeholder-hpText3 outline-none transition-colors
                                        ${errors.domain_name ? 'border-red-500' : 'border-hpBorder focus:border-hpAccent'}`}
                                    placeholder="example.com"
                                />
                                {errors.domain_name && (
                                    <p className="mt-2 text-[12px] text-red-400">{errors.domain_name}</p>
                                )}
                                <p className="mt-2 text-[11px] text-hpText3">
                                    Enter your domain name without http:// or https://
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-hpAccent text-white px-5 py-2 rounded-md text-[12px] font-medium hover:bg-hpAccent/90 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing...' : '+ Add Domain'}
                                </button>
                                <Link
                                    href={route('domains.index')}
                                    className="flex items-center gap-2 bg-hpBg border border-hpBorder text-hpText2 px-5 py-2 rounded-md text-[12px] font-medium hover:border-hpBorder2 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Quick Tips</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-[12px] text-white font-medium mb-1">DNS Setup Required</div>
                                <div className="text-[11px] text-hpText3 leading-relaxed">
                                    Make sure your domain DNS points to: <span className="text-hpAccent2 font-mono">43.134.37.14</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[12px] text-white font-medium mb-1">Propagation Time</div>
                                <div className="text-[11px] text-hpText3 leading-relaxed">
                                    DNS changes may take up to 24-48 hours to propagate globally
                                </div>
                            </div>
                            <div>
                                <div className="text-[12px] text-white font-medium mb-1">SSL Certificate</div>
                                <div className="text-[11px] text-hpText3 leading-relaxed">
                                    Free Let's Encrypt SSL will be auto-provisioned for your domain
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden mt-4">
                        <div className="px-5 py-3.5 border-b border-hpBorder">
                            <span className="text-[13px] text-white font-medium">Server Info</span>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Server IP</span>
                                <span className="text-[12px] text-white font-mono">43.134.37.14</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Port</span>
                                <span className="text-[12px] text-white font-mono">80 / 443</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-hpText3 uppercase tracking-wider">Web Root</span>
                                <span className="text-[12px] text-white font-mono">/var/www</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
