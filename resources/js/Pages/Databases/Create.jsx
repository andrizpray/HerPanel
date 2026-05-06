import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ flash, errors: pageErrors }) {
    const [data, setData] = useState({
        db_name: '',
        db_user: '',
        db_password: '',
        character_set: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        
        router.post(route('databases.store'), data, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Database" />
            
            <div className="p-5 md:p-8">
                <div className="max-w-2xl">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href={route('databases.index')}
                            className="inline-flex items-center gap-1.5 text-[11px] text-hpText3 hover:text-white transition-colors mb-3"
                        >
                            ← Back to Databases
                        </Link>
                        <h1 className="text-[15px] font-semibold text-white">Create Database</h1>
                        <p className="text-[12px] text-hpText2 mt-1">Create a new MySQL database</p>
                    </div>

                    {/* All Errors Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded-lg">
                            <div className="font-medium mb-2">Please fix the following errors:</div>
                            {errors.error && <div>• {errors.error}</div>}
                            {errors.db_name && <div>• Database Name: {errors.db_name}</div>}
                            {errors.db_user && <div>• Database User: {errors.db_user}</div>}
                            {errors.db_password && <div>• Password: {errors.db_password}</div>}
                        </div>
                    )}

                    {/* Success Message */}
                    {flash?.success && (
                        <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-lg">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-hpBg2 border border-hpBorder rounded-xl p-5 space-y-4">
                        {/* Database Name */}
                        <div>
                            <InputLabel htmlFor="db_name" value="Database Name" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="db_name"
                                type="text"
                                value={data.db_name}
                                onChange={(e) => setData({...data, db_name: e.target.value})}
                                placeholder="mydatabase"
                                className="mt-1.5 block w-full"
                                required
                            />
                            <p className="text-[11px] text-hpText3 mt-1">Only letters, numbers, and underscores allowed.</p>
                        </div>

                        {/* Database User */}
                        <div>
                            <InputLabel htmlFor="db_user" value="Database User" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="db_user"
                                type="text"
                                value={data.db_user}
                                onChange={(e) => setData({...data, db_user: e.target.value})}
                                placeholder="dbuser"
                                className="mt-1.5 block w-full"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="db_password" value="Password" className="text-[11px] uppercase tracking-wider" />
                            <TextInput
                                id="db_password"
                                type="password"
                                value={data.db_password}
                                onChange={(e) => setData({...data, db_password: e.target.value})}
                                placeholder="Minimum 8 characters"
                                className="mt-1.5 block w-full"
                                required
                                minLength={8}
                            />
                        </div>

                        {/* Character Set */}
                        <div>
                            <InputLabel htmlFor="character_set" value="Character Set" className="text-[11px] uppercase tracking-wider" />
                            <select
                                id="character_set"
                                value={data.character_set}
                                onChange={(e) => setData({...data, character_set: e.target.value})}
                                className="mt-1.5 w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                            >
                                <option value="utf8mb4">utf8mb4</option>
                                <option value="utf8">utf8</option>
                                <option value="latin1">latin1</option>
                            </select>
                        </div>

                        {/* Collation */}
                        <div>
                            <InputLabel htmlFor="collation" value="Collation" className="text-[11px] uppercase tracking-wider" />
                            <select
                                id="collation"
                                value={data.collation}
                                onChange={(e) => setData({...data, collation: e.target.value})}
                                className="mt-1.5 w-full px-3 py-2 bg-hpBg border border-hpBorder rounded-md text-[12px] text-white outline-none focus:border-hpAccent"
                            >
                                <option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci</option>
                                <option value="utf8mb4_general_ci">utf8mb4_general_ci</option>
                                <option value="utf8_general_ci">utf8_general_ci</option>
                                <option value="latin1_swedish_ci">latin1_swedish_ci</option>
                            </select>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-3 pt-3">
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Creating...' : 'Create Database'}
                            </PrimaryButton>
                            <Link
                                href={route('databases.index')}
                                className="px-5 py-2.5 bg-hpBg border border-hpBorder text-hpText2 rounded-md text-[12px] font-medium hover:bg-hpBg2 transition-all"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
