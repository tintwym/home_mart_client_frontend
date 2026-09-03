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
import {
    validatePassword,
    validatePasswordConfirmation,
} from '@/lib/form-validation';

export default function PasswordSettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { values, errors, setValue, blurField, validateAll, setValues } =
        useFieldValidation(
            {
                currentPassword: '',
                password: '',
                passwordConfirmation: '',
            },
            {
                currentPassword: (value) => validatePassword(value, 1),
                password: (value) => validatePassword(value),
                passwordConfirmation: (value, all) =>
                    validatePasswordConfirmation(all.password, value),
            },
        );

    useEffect(() => {
        if (!loading && !user) router.replace(loginHref('/settings/password'));
    }, [loading, user, router]);

    if (loading) return <PageLoading label="Loading…" />;
    if (!user) return <PageLoading label="Redirecting…" />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader title="Password" />
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
                        await apiFetch('/api/user/password', {
                            method: 'PUT',
                            body: {
                                current_password: values.currentPassword,
                                password: values.password,
                                password_confirmation:
                                    values.passwordConfirmation,
                            },
                        });
                        setMessage('Password updated');
                        setValues({
                            currentPassword: '',
                            password: '',
                            passwordConfirmation: '',
                        });
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
                    id="current"
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                    value={values.currentPassword}
                    onChange={(value) => setValue('currentPassword', value)}
                    onBlur={() => blurField('currentPassword')}
                    error={errors.currentPassword}
                    disabled={saving}
                />
                <ValidatedField
                    id="password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={values.password}
                    onChange={(value) => setValue('password', value)}
                    onBlur={() => blurField('password')}
                    error={errors.password}
                    disabled={saving}
                />
                <ValidatedField
                    id="confirm"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    value={values.passwordConfirmation}
                    onChange={(value) =>
                        setValue('passwordConfirmation', value)
                    }
                    onBlur={() => blurField('passwordConfirmation')}
                    error={errors.passwordConfirmation}
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
                    {saving ? 'Saving…' : 'Update password'}
                </Button>
            </form>
        </div>
    );
}
