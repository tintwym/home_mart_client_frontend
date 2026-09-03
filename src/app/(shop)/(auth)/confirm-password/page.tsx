'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AuthCard } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { useFieldValidation } from '@/hooks/use-field-validation';
import { validatePassword } from '@/lib/form-validation';

export default function ConfirmPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const { values, errors, setValue, blurField, validateAll } =
        useFieldValidation(
            { password: '' },
            { password: (value) => validatePassword(value, 1) },
        );

    return (
        <AuthCard
            title="Confirm password"
            description="This is a secure area. Please confirm your password."
        >
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) return;
                    setBusy(true);
                    setError(null);
                    try {
                        await apiFetch('/api/user/confirm-password', {
                            method: 'POST',
                            body: { password: values.password },
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
                <ValidatedField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={(value) => setValue('password', value)}
                    onBlur={() => blurField('password')}
                    error={errors.password}
                    disabled={busy}
                />
                {error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Confirming…' : 'Confirm'}
                </Button>
            </form>
        </AuthCard>
    );
}
