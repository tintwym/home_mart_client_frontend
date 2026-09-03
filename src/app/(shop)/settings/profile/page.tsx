'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { useFieldValidation } from '@/hooks/use-field-validation';
import { validateName, validatePhone } from '@/lib/form-validation';

export default function ProfileSettingsPage() {
    const { user, loading, refresh } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);

    const { values, errors, setValue, blurField, validateAll, setValues } =
        useFieldValidation(
            { name: '', phone: '', address: '' },
            {
                name: (value) => validateName(value),
                phone: (value) => validatePhone(value),
                address: () => undefined,
            },
        );

    useEffect(() => {
        if (!loading && !user) router.replace(loginHref('/settings/profile'));
        if (user && !hydrated) {
            setValues({
                name: user.name || '',
                phone: (user.phone as string) || '',
                address: (user.address as string) || '',
            });
            setHydrated(true);
        }
    }, [loading, user, router, hydrated, setValues]);

    if (loading) return <PageLoading label="Loading profile…" />;
    if (!user) return <PageLoading label="Redirecting…" />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader title="Profile" />
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) return;
                    setSaving(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await apiFetch('/api/profile', {
                            method: 'PATCH',
                            body: {
                                name: values.name.trim(),
                                phone: values.phone.trim(),
                                address: values.address.trim(),
                            },
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
                <ValidatedField
                    id="name"
                    label="Name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(value) => setValue('name', value)}
                    onBlur={() => blurField('name')}
                    error={errors.name}
                    disabled={saving}
                />
                <ValidatedField
                    id="email"
                    label="Email"
                    value={user.email}
                    onChange={() => undefined}
                    disabled
                />
                <ValidatedField
                    id="phone"
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Optional"
                    value={values.phone}
                    onChange={(value) => setValue('phone', value)}
                    onBlur={() => blurField('phone')}
                    error={errors.phone}
                    disabled={saving}
                />
                <ValidatedField
                    id="address"
                    label="Address"
                    autoComplete="street-address"
                    placeholder="Optional"
                    value={values.address}
                    onChange={(value) => setValue('address', value)}
                    onBlur={() => blurField('address')}
                    error={errors.address}
                    disabled={saving}
                />
                {error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
                {message ? (
                    <p className="text-sm text-primary">{message}</p>
                ) : null}
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
            </form>
        </div>
    );
}
