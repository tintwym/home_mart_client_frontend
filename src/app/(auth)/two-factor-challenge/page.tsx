'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmTwoFactor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AuthCard } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TwoFactorChallengePage() {
    const { setSession } = useAuth();
    const router = useRouter();
    const [code, setCode] = useState('');
    const [recovery, setRecovery] = useState('');
    const [useRecovery, setUseRecovery] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <AuthCard
            title="Two-factor challenge"
            description="Enter your authenticator code to continue"
        >
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError(null);
                    try {
                        const res = await confirmTwoFactor(
                            useRecovery
                                ? { recovery_code: recovery }
                                : { code },
                        );
                        setSession(res.user, res.token);
                        router.push('/');
                    } catch (err) {
                        setError(
                            err instanceof Error
                                ? err.message
                                : 'Verification failed',
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                {useRecovery ? (
                    <div className="space-y-2">
                        <Label htmlFor="recovery">Recovery code</Label>
                        <Input
                            id="recovery"
                            value={recovery}
                            onChange={(e) => setRecovery(e.target.value)}
                            required
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="code">Authentication code</Label>
                        <Input
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                )}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Verifying…' : 'Continue'}
                </Button>
                <button
                    type="button"
                    className="w-full text-sm underline"
                    onClick={() => setUseRecovery((v) => !v)}
                >
                    {useRecovery
                        ? 'Use authenticator code'
                        : 'Use a recovery code'}
                </button>
            </form>
        </AuthCard>
    );
}
