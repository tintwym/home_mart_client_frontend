'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AuthCard } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <AuthCard
            title="Verify email"
            description={
                user
                    ? `We sent a verification link to ${user.email}`
                    : 'Verify your email address to continue'
            }
        >
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-primary">{message}</p> : null}
            <Button
                className="w-full"
                disabled={busy}
                onClick={async () => {
                    setBusy(true);
                    setError(null);
                    try {
                        await apiFetch(
                            '/api/email/verification-notification',
                            { method: 'POST', body: {} },
                        );
                        setMessage('Verification email sent.');
                    } catch (e) {
                        setError(
                            e instanceof Error ? e.message : 'Request failed',
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                Resend verification email
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/')}
            >
                Continue to home
            </Button>
        </AuthCard>
    );
}
