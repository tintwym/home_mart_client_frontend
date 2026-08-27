'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthDivider, AuthPanel } from '@/components/auth/auth-panel';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { isFirebaseConfigured } from '@/lib/firebase';
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

    const formDisabled = busy;
    const socialAvailable = isFirebaseConfigured();

    return (
        <AuthPanel
            title="Create your account"
            description="Join Home Mart to list items and checkout securely"
            footer={
                <>
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <SocialAuthButtons disabled={formDisabled} onError={setError} />

            {socialAvailable ? (
                <AuthDivider label="or register with email" />
            ) : null}

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
                    label="Full name"
                    autoComplete="name"
                    placeholder="Your name"
                    value={values.name}
                    onChange={(value) => setValue('name', value)}
                    onBlur={() => blurField('name')}
                    error={errors.name}
                    disabled={formDisabled}
                />
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
                    disabled={formDisabled}
                />
                <ValidatedField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={values.password}
                    onChange={(value) => setValue('password', value)}
                    onBlur={() => blurField('password')}
                    error={errors.password}
                    disabled={formDisabled}
                />
                <ValidatedField
                    id="confirm"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={values.passwordConfirmation}
                    onChange={(value) =>
                        setValue('passwordConfirmation', value)
                    }
                    onBlur={() => blurField('passwordConfirmation')}
                    error={errors.passwordConfirmation}
                    disabled={formDisabled}
                />

                {error ? (
                    <p
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}

                <Button type="submit" className="h-11 w-full" disabled={formDisabled}>
                    {busy ? 'Creating account…' : 'Create account'}
                </Button>

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    By continuing, you agree to our marketplace terms and
                    privacy policy.
                </p>
            </form>
        </AuthPanel>
    );
}
