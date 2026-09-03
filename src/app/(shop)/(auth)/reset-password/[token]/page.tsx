'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import { AuthCard, PageLoading } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { useFieldValidation } from '@/hooks/use-field-validation';
import {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
} from '@/lib/form-validation';

function ResetPasswordForm() {
    const { token } = useParams<{ token: string }>();
    const search = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const { values, errors, setValue, blurField, validateAll } =
        useFieldValidation(
            {
                email: search.get('email') || '',
                password: '',
                passwordConfirmation: '',
            },
            {
                email: (value) => validateEmail(value),
                password: (value) => validatePassword(value),
                passwordConfirmation: (value, all) =>
                    validatePasswordConfirmation(all.password, value),
            },
        );

    return (
        <AuthCard title="Reset password" description="Choose a new password">
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) return;
                    setBusy(true);
                    setError(null);
                    try {
                        await resetPassword({
                            token,
                            email: values.email.trim(),
                            password: values.password,
                            password_confirmation: values.passwordConfirmation,
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
                <ValidatedField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(value) => setValue('email', value)}
                    onBlur={() => blurField('email')}
                    error={errors.email}
                    disabled={busy}
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
                    disabled={busy}
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
                    disabled={busy}
                />
                {error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
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
