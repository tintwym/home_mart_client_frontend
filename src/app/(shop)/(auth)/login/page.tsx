'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AuthDivider, AuthPanel } from '@/components/auth/auth-panel';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import {
    browserSupportsWebAuthn,
    startAuthentication,
} from '@/lib/passkeys-client';
import { useFieldValidation } from '@/hooks/use-field-validation';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
    validateEmail,
    validatePassword,
} from '@/lib/form-validation';

export default function LoginPage() {
    const { login, setSession } = useAuth();
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

    const formDisabled = busy;
    const socialAvailable = isFirebaseConfigured();

    return (
        <AuthPanel
            title="Welcome back"
            description="Sign in to buy, sell, and message sellers"
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        Create one
                    </Link>
                </>
            }
        >
            <SocialAuthButtons disabled={formDisabled} onError={setError} />

            {socialAvailable ? <AuthDivider /> : null}

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
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(value) => setValue('email', value)}
                    onBlur={() => blurField('email')}
                    error={errors.email}
                    disabled={formDisabled}
                />
                <ValidatedField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={values.password}
                    onChange={(value) => setValue('password', value)}
                    onBlur={() => blurField('password')}
                    error={errors.password}
                    disabled={formDisabled}
                />

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {error ? (
                    <p
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}

                <Button type="submit" className="h-11 w-full" disabled={formDisabled}>
                    {busy ? 'Signing in…' : 'Sign in with email'}
                </Button>
            </form>

            {browserSupportsWebAuthn() ? (
                <Button
                    type="button"
                    variant="ghost"
                    disabled={formDisabled}
                    className="h-11 w-full gap-2 text-muted-foreground"
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
                                    : 'Passkey sign-in failed',
                            );
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    <KeyRound className="size-4" />
                    Sign in with passkey
                </Button>
            ) : null}
        </AuthPanel>
    );
}
