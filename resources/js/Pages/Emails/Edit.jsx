import React from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ email }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('emails.update', email.id));
    };

    return (
        <AuthenticatedLayout header="Change Email Password">
            <div className="max-w-md mx-auto p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-hpText">{email.email}</h2>
                    <p className="text-sm text-hpMuted">{email.domain_name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-hpText mb-2">New Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded border-hpBorder bg-hpBg1 text-hpText px-3 py-2"
                            placeholder="Enter new password"
                        />
                        {errors.password && (
                            <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded bg-hpAccent1 px-4 py-2 text-white font-medium disabled:opacity-50"
                        >
                            Update Password
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
