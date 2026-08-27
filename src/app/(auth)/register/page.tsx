'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthCard } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { useFieldValidation } from '@/hooks/use-field-validation';
import {
    validateEmail,
    validateName,
    validatePassword,
    validatePasswordConfirmation,
} from '@/lib/form-validation';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const {
        values,
        errors,
        setValue,
        blurField,
        validateAll,
        clearErrors,
    } = useFieldValidation(
        {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
        {
            name: (value) => validateName(value),
            email: (value) => validateEmail(value),
            password: (value) => validatePassword(value),
            passwordConfirmation: (value, all) =>
                validatePasswordConfirmation(all.password, value),
        },
    );

    return (
        <AuthCard
            title="Create account"
            description="Join Home Mart to buy and sell"
            footer={
                <>
                    Already registered?{' '}
                    <Link href="/login" className="font-medium underline">
                        Log in
                    </Link>
                </>
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
                    clearErrors();
                    try {
                        await register({
                            name: values.name.trim(),
                            email: values.email.trim(),
                            password: values.password,
                            password_confirmation: values.passwordConfirmation,
                        });
                        router.push('/');
                    } catch (err) {
                        setError(
                            err instanceof Error
                                ? err.message
                                : 'Registration failed',
                        );
                    } finally {
                        setBusy(false);
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
                    disabled={busy}
                />
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
                    label="Password"
                    type="password"
                    autoComplete="new-password"
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
                    <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? 'Creating…' : 'Register'}
                </Button>
            </form>
        </AuthCard>
    );
}
