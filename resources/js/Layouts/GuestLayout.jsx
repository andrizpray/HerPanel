import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-hpBg flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-hpAccent rounded-xl text-white text-xl font-bold flex items-center justify-center">
                            H
                        </div>
                        <div className="text-left">
                            <span className="text-xl font-semibold text-white tracking-wide">
                                HerPanel
                            </span>
                            <div className="text-[11px] text-hpText3">Cloud Hosting Panel</div>
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-hpBg2 border border-hpBorder rounded-xl overflow-hidden">
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-[11px] text-hpText3">
                    <span>© {new Date().getFullYear()} HerPanel. All rights reserved.</span>
                </div>
            </div>
        </div>
    );
}
