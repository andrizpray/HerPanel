import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">HerPanel</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/domains" className="text-gray-700 hover:text-gray-900">Domains</a>
                            <a href="/emails" className="text-gray-700 hover:text-gray-900">Emails</a>
                            <a href="/email-filters" className="text-gray-700 hover:text-gray-900">Filters</a>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-6">
                {children}
            </main>
        </div>
    );
}
