'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { AuthPanel } from '@/components/auth/auth-panel';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { validateEmail } from '@/lib/form-validation';
import { useFieldValidation } from '@/hooks/use-field-validation';

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const { values, errors, setValue, blurField, validateAll } =
        useFieldValidation(
            { email: '' },
            { email: (value) => validateEmail(value) },
        );

    return (
        <AuthPanel
            title="Reset password"
            description="We'll send a link to your email"
            footer={
                <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                    Back to sign in
                </Link>
            }
        >
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) {
                        return;
                    }
                    setBusy(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await forgotPassword(values.email.trim());
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
                <ValidatedField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(value) => setValue('email', value)}
                    onBlur={() => blurField('email')}
                    error={errors.email}
                    disabled={busy}
                />
                {error ? (
                    <p
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
                {message ? (
                    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                        {message}
                    </p>
                ) : null}
                <Button type="submit" className="h-11 w-full" disabled={busy}>
                    {busy ? 'Sending…' : 'Send reset link'}
                </Button>
            </form>
        </AuthPanel>
    );
}
