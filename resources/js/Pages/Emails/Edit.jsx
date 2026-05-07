import React, { useState } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';

export default function Edit() {
    const { email } = usePage().props;
    const [form, setForm] = useState({ password: '', quota_mb: email.quota_mb || 1024 });

    const handleUpdate = (e) => {
        e.preventDefault();
        router.put(`/emails/${email.id}`, form);
    };

    return (
        <Layout>
            <div className="hp-container">
                <div className="hp-flex hp-justify-between hp-items-center hp-mb-6">
                    <h1 className="hp-text-2xl hp-font-bold">Edit Email: {email.email}</h1>
                    <Link href="/emails" className="hp-btn hp-btn-secondary">Back</Link>
                </div>

                <div className="hp-card">
                    <form onSubmit={handleUpdate}>
                        <div className="hp-form-group">
                            <label>Email Address</label>
                            <input type="text" className="hp-form-input" value={email.email} disabled />
                        </div>
                        <div className="hp-form-group">
                            <label>New Password (leave blank to keep current)</label>
                            <input type="password" className="hp-form-input" placeholder="Enter new password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                        </div>
                        <div className="hp-form-group">
                            <label>Quota (MB)</label>
                            <input type="number" className="hp-form-input" value={form.quota_mb} onChange={(e) => setForm({...form, quota_mb: e.target.value})} />
                        </div>
                        <div className="hp-flex hp-gap-2 hp-mt-4">
                            <button type="submit" className="hp-btn hp-btn-primary">Update</button>
                            <Link href="/emails" className="hp-btn hp-btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
