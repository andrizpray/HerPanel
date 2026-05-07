import React, { useState } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { emails, domains } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({ domain_id: '', prefix: '', password: '', quota_mb: 1024 });

    const handleCreate = (e) => {
        e.preventDefault();
        router.post('/emails', form, {
            onSuccess: () => { setShowCreateModal(false); setForm({ domain_id: '', prefix: '', password: '', quota_mb: 1024 }); },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this email account?')) {
            Inertia.delete(`/emails/${id}`);
        }
    };

    return (
        <Layout>
            <div className="hp-container">
                <div className="hp-flex hp-justify-between hp-items-center hp-mb-6">
                    <h1 className="hp-text-2xl hp-font-bold">Email Accounts</h1>
                    <button className="hp-btn hp-btn-primary" onClick={() => setShowCreateModal(true)}>
                        Add Email
                    </button>
                </div>

                <div className="hp-card">
                    <table className="hp-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Domain</th>
                                <th>Quota (MB)</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emails.map((email) => (
                                <tr key={email.id}>
                                    <td>{email.email}</td>
                                    <td>{email.domain_name}</td>
                                    <td>{email.quota_mb}</td>
                                    <td>{new Date(email.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/emails/${email.id}/edit`} className="hp-btn hp-btn-sm hp-btn-secondary hp-mr-2">Edit</Link>
                                        <button onClick={() => handleDelete(email.id)} className="hp-btn hp-btn-sm hp-btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showCreateModal && (
                    <div className="hp-modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Create Email Account</h2>
                            <form onSubmit={handleCreate}>
                                <div className="hp-form-group">
                                    <label>Domain</label>
                                    <select className="hp-form-input" value={form.domain_id} onChange={(e) => setForm({...form, domain_id: e.target.value})}>
                                        <option value="">Select Domain</option>
                                        {domains.map((d) => (
                                            <option key={d.id} value={d.id}>{d.domain_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="hp-form-group">
                                    <label>Email Prefix</label>
                                    <input type="text" className="hp-form-input" placeholder="e.g., info" value={form.prefix} onChange={(e) => setForm({...form, prefix: e.target.value})} />
                                </div>
                                <div className="hp-form-group">
                                    <label>Password</label>
                                    <input type="password" className="hp-form-input" placeholder="Enter password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                                </div>
                                <div className="hp-form-group">
                                    <label>Quota (MB)</label>
                                    <input type="number" className="hp-form-input" value={form.quota_mb} onChange={(e) => setForm({...form, quota_mb: e.target.value})} />
                                </div>
                                <div className="hp-flex hp-gap-2 hp-mt-4">
                                    <button type="submit" className="hp-btn hp-btn-primary">Create</button>
                                    <button type="button" className="hp-btn hp-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
