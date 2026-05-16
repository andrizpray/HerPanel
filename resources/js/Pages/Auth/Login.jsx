import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import PasswordInput from '@/Components/PasswordInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header */}
            <div className="px-6 py-5 border-b border-hpBorder">
                <h2 className="text-[15px] font-semibold text-white">Welcome back</h2>
                <p className="text-[12px] text-slate-400 mt-1">Sign in to access your panel</p>
            </div>

            {/* Status Message */}
            {status && (
                <div className="mx-6 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium">
                    {status}
                </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="p-6">
                <div className="mb-4">
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@example.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[11px] text-hpAccent2 hover:text-hpAccent transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-[12px] text-hpText2 select-none">
                            Remember me for 30 days
                        </span>
                    </label>
                </div>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Signing in...' : 'Sign in'}
                </PrimaryButton>
            </form>

            {/* Server Info Footer */}
            <div className="px-6 py-4 border-t border-hpBorder bg-hpBg/50">
                <div className="flex items-center justify-between text-[11px] text-hpText3">
                    <span>Server: vps-id-jkt-01</span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online
                    </span>
                </div>
            </div>
        </GuestLayout>
    );
}
