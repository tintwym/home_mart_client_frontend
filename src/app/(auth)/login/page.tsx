'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AuthCard } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    browserSupportsWebAuthn,
    startAuthentication,
} from '@/lib/passkeys-client';
import { isFirebaseConfigured, signInWithSocial } from '@/lib/firebase';

export default function LoginPage() {
    const { login, loginWithFirebase, setSession } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

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
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError(null);
                    try {
                        await login(email, password);
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
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
