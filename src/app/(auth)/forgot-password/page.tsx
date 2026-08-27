'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { AuthCard } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <AuthCard
            title="Forgot password"
            description="We'll email you a reset link"
            footer={
                <Link href="/login" className="underline">
                    Back to login
                </Link>
            }
        >
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await forgotPassword(email);
                        setMessage('If that email exists, a reset link was sent.');
                    } catch (err) {
                        setError(
                            err instanceof Error ? err.message : 'Request failed',
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
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {message ? <p className="text-sm text-primary">{message}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Sending…' : 'Email reset link'}
                </Button>
            </form>
        </AuthCard>
    );
}
