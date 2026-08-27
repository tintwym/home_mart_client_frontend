'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AuthCard } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <AuthCard
            title="Confirm password"
            description="This is a secure area. Please confirm your password."
        >
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError(null);
                    try {
                        await apiFetch('/api/user/confirm-password', {
                            method: 'POST',
                            body: { password },
                        });
                        router.back();
                    } catch (err) {
                        setError(
                            err instanceof Error
                                ? err.message
                                : 'Confirmation failed',
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Confirming…' : 'Confirm'}
                </Button>
            </form>
        </AuthCard>
    );
}
