import React from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ email }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        quota_mb: email.quota_mb || 1024,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('emails.update', email.id));
    };

    return (
        <AuthenticatedLayout header="Edit Email Account">
            <div className="max-w-md mx-auto p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-hpText">{email.email}</h2>
                    <p className="text-sm text-hpMuted">{email.domain_name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-hpText mb-2">New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                            placeholder="Enter new password"
                        />
                        {errors.password && (
                            <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-hpText mb-2">Quota (MB)</label>
                        <input
                            type="number"
                            value={data.quota_mb}
                            onChange={(e) => setData('quota_mb', e.target.value)}
                            min="100"
                            max="10240"
                            className="w-full rounded border-hpBorder bg-hpBg2 text-hpText px-3 py-2"
                        />
                        <div className="text-xs text-hpMuted mt-1">Default: 1024 MB (1 GB). Max: 10240 MB (10 GB).</div>
                        {errors.quota_mb && (
                            <div className="text-red-500 text-xs mt-1">{errors.quota_mb}</div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded bg-hpAccent px-4 py-2 text-white font-medium disabled:opacity-50"
                        >
                            Update Account
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="flex-1 rounded bg-hpBorder px-4 py-2 text-hpText font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
