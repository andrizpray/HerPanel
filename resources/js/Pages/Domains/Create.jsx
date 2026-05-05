import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        domain_name: '',
    });
    const [focused, setFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('domains.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="page-header">
                    <h1 className="page-title font-syne text-2xl font-extrabold text-white tracking-[1px] flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        ADD NEW <span className="text-nexAccent">DOMAIN</span>
                    </h1>
                    <p className="page-sub text-[11px] text-nexText2 font-medium mt-2 tracking-[1px]">
                        // Configure your new domain
                    </p>
                </div>
            }
        >
            <Head title="Add Domain" />

            <div className={`grid grid-cols-3 gap-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
                {/* Form Panel */}
                <div className="col-span-2">
                    <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-nexBorder">
                            <span className="text-[11px] text-nexText2 tracking-[2px] uppercase font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                Domain Configuration
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="mb-6">
                                <label className="block text-[11px] text-nexText2 uppercase tracking-wider mb-2 font-semibold">
                                    Domain Name
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nexText3 text-sm">◎</span>
                                    <input
                                        type="text"
                                        value={data.domain_name}
                                        onChange={(e) => setData('domain_name', e.target.value)}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        className={`w-full pl-10 pr-4 py-3 bg-nexBg2 border rounded-xl text-[13px] text-white placeholder-nexText3/50 transition-all duration-200 outline-none
                                            ${errors.domain_name 
                                                ? 'border-red-500/50 focus:border-red-500' 
                                                : 'border-nexBorder focus:border-nexAccent focus:shadow-lg focus:shadow-nexAccent/10'}`}
                                        placeholder="example.com"
                                    />
                                </div>
                                {errors.domain_name && (
                                    <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1">
                                        <span>⚠</span> {errors.domain_name}
                                    </p>
                                )}
                                <p className="mt-2 text-[10px] text-nexText3">
                                    Enter your domain name without http:// or https://
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-nexAccent text-nexBg px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-[1px] transition-all duration-200 hover:bg-nexAccent/90 hover:shadow-lg hover:shadow-nexAccent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <span className="animate-spin">◌</span> PROCESSING...
                                        </>
                                    ) : (
                                        <>
                                            <span>+</span> ADD DOMAIN
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={route('domains.index')}
                                    className="flex items-center gap-2 bg-nexBg2 border border-nexBorder text-nexText2 px-6 py-2.5 rounded-xl text-[11px] font-semibold tracking-[1px] transition-all duration-200 hover:border-nexBorder2 hover:text-nexText"
                                >
                                    ← CANCEL
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="col-span-1">
                    <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-nexBorder">
                            <span className="text-[11px] text-nexText2 tracking-[2px] uppercase font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                Quick Tips
                            </span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-cyan-400 text-sm mt-0.5">●</span>
                                <div>
                                    <div className="text-[11px] text-white font-medium mb-1">DNS Setup Required</div>
                                    <div className="text-[10px] text-nexText3 leading-relaxed">
                                        Make sure your domain's DNS points to our server IP: <span className="text-nexAccent">43.134.37.14</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-emerald-400 text-sm mt-0.5">●</span>
                                <div>
                                    <div className="text-[11px] text-white font-medium mb-1">Propagation Time</div>
                                    <div className="text-[10px] text-nexText3 leading-relaxed">
                                        DNS changes may take up to 24-48 hours to propagate globally
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-yellow-400 text-sm mt-0.5">●</span>
                                <div>
                                    <div className="text-[11px] text-white font-medium mb-1">SSL Certificate</div>
                                    <div className="text-[10px] text-nexText3 leading-relaxed">
                                        Free Let's Encrypt SSL will be auto-provisioned for your domain
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Server Info */}
                    <div className="panel bg-nexPanel border border-nexBorder rounded-xl overflow-hidden mt-4">
                        <div className="px-5 py-4 border-b border-nexBorder">
                            <span className="text-[11px] text-nexText2 tracking-[2px] uppercase font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                Server Info
                            </span>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Server IP</span>
                                <span className="text-[11px] text-white font-mono">43.134.37.14</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Port</span>
                                <span className="text-[11px] text-white font-mono">80 / 443</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-nexText3 uppercase tracking-wider">Web Root</span>
                                <span className="text-[11px] text-white font-mono">/var/www</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
