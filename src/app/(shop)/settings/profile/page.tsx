'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfileSettingsPage() {
    const { user, loading, refresh } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) router.replace(loginHref('/settings/profile'));
        if (user) {
            setName(user.name || '');
            setPhone((user.phone as string) || '');
            setAddress((user.address as string) || '');
        }
    }, [loading, user, router]);

    if (loading) return <PageLoading label="Loading profile…" />;
    if (!user) return <PageLoading label="Redirecting…" />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader title="Profile" />
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await apiFetch('/api/profile', {
                            method: 'PATCH',
                            body: { name, phone, address },
                        });
                        await refresh();
                        setMessage('Profile updated');
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {message ? <p className="text-sm text-primary">{message}</p> : null}
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
            </form>
        </div>
    );
}
