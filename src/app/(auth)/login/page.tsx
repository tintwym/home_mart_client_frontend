'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AuthCard } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import {
    browserSupportsWebAuthn,
    startAuthentication,
} from '@/lib/passkeys-client';
import { isFirebaseConfigured, signInWithSocial } from '@/lib/firebase';
import { useFieldValidation } from '@/hooks/use-field-validation';
import {
    validateEmail,
    validatePassword,
} from '@/lib/form-validation';

export default function LoginPage() {
    const { login, loginWithFirebase, setSession } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const {
        values,
        errors,
        setValue,
        blurField,
        validateAll,
        clearErrors,
    } = useFieldValidation(
        { email: '', password: '' },
        {
            email: (value) => validateEmail(value),
            password: (value) => validatePassword(value, 1),
        },
    );

    return (
        <AuthCard
            title="Log in"
            description="Welcome back to Home Mart"
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium underline">
                        Register
                    </Link>
                </>
            }
        >
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) {
                        return;
                    }
                    setBusy(true);
                    setError(null);
                    clearErrors();
                    try {
                        await login(values.email.trim(), values.password);
                        router.push('/');
                    } catch (err) {
                        if (
                            err instanceof ApiError &&
                            (err.errors.two_factor_required ||
                                err.errors.two_factor)
                        ) {
                            router.push('/two-factor-challenge');
                            return;
                        }
                        setError(
                            err instanceof Error
                                ? err.message
                                : 'Login failed',
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <ValidatedField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="username"
                    value={values.email}
                    onChange={(value) => setValue('email', value)}
                    onBlur={() => blurField('email')}
                    error={errors.email}
                    disabled={busy}
                />
                <ValidatedField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={(value) => setValue('password', value)}
                    onBlur={() => blurField('password')}
                    error={errors.password}
                    disabled={busy}
                />
                {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Signing in…' : 'Log in'}
                </Button>
            </form>

            <div className="text-center text-sm">
                <Link href="/forgot-password" className="underline">
                    Forgot password?
                </Link>
            </div>

            {isFirebaseConfigured() ? (
                <div className="grid gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            setError(null);
                            try {
                                const { idToken } =
                                    await signInWithSocial('google');
                                await loginWithFirebase(idToken);
                                router.push('/');
                            } catch (err) {
                                setError(
                                    err instanceof Error
                                        ? err.message
                                        : 'Google sign-in failed',
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        Continue with Google
                    </Button>
                </div>
            ) : null}

            {browserSupportsWebAuthn() ? (
                <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    className="w-full"
                    onClick={async () => {
                        setBusy(true);
                        setError(null);
                        try {
                            const { apiFetch, setToken } = await import(
                                '@/lib/api'
                            );
                            const optionsJSON = await apiFetch(
                                '/api/passkeys/authentication-options',
                                { method: 'POST', auth: false, body: {} },
                            );
                            const credential = await startAuthentication({
                                optionsJSON: optionsJSON as never,
                            });
                            const state =
                                typeof (optionsJSON as { state?: string })
                                    ?.state === 'string'
                                    ? (optionsJSON as { state: string }).state
                                    : undefined;
                            const res = await apiFetch<{
                                user: import('@/lib/api').AuthUser;
                                token: string;
                            }>('/api/passkeys/authenticate', {
                                method: 'POST',
                                auth: false,
                                body: {
                                    start_authentication_response:
                                        JSON.stringify(credential),
                                    ...(state ? { state } : {}),
                                },
                            });
                            setToken(res.token);
                            setSession(res.user, res.token);
                            router.push('/');
                        } catch (err) {
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : 'Passkey failed',
                            );
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    Sign in with passkey
                </Button>
            ) : null}
        </AuthCard>
    );
}
