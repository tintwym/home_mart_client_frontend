'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PasswordSettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    if (!user) return null;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader title="Password" />
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await apiFetch('/api/user/password', {
                            method: 'PUT',
                            body: {
                                current_password: currentPassword,
                                password,
                                password_confirmation: passwordConfirmation,
                            },
                        });
                        setMessage('Password updated');
                        setCurrentPassword('');
                        setPassword('');
                        setPasswordConfirmation('');
                    } catch (err) {
                        setError(
                            err instanceof Error ? err.message : 'Update failed',
                        );
                    } finally {
                        setSaving(false);
                    }
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="current">Current password</Label>
                    <Input
                        id="current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {message ? <p className="text-sm text-primary">{message}</p> : null}
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Update password'}
                </Button>
            </form>
        </div>
    );
}
