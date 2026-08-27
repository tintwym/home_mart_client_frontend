'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import { AuthCard, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
    const { token } = useParams<{ token: string }>();
    const search = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState(search.get('email') || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <AuthCard title="Reset password" description="Choose a new password">
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError(null);
                    try {
                        await resetPassword({
                            token,
                            email,
                            password,
                            password_confirmation: passwordConfirmation,
                        });
                        router.push('/login');
                    } catch (err) {
                        setError(
                            err instanceof Error ? err.message : 'Reset failed',
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                        }
                        required
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Saving…' : 'Reset password'}
                </Button>
            </form>
        </AuthCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
