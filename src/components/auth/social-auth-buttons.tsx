'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocialAuth } from '@/hooks/use-social-auth';
import type { SocialProvider } from '@/lib/firebase';
import { cn } from '@/lib/utils';

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

function AppleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
    );
}

type SocialAuthButtonsProps = {
    disabled?: boolean;
    onError?: (message: string) => void;
};

export function SocialAuthButtons({
    disabled = false,
    onError,
}: SocialAuthButtonsProps) {
    const { available, busyProvider, isBusy, signInWithProvider } =
        useSocialAuth();

    if (!available) {
        return null;
    }

    const handleClick = async (provider: SocialProvider) => {
        try {
            await signInWithProvider(provider);
        } catch (err) {
            onError?.(
                err instanceof Error
                    ? err.message
                    : `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed`,
            );
        }
    };

    return (
        <div className="grid gap-2.5">
            <SocialButton
                label="Continue with Google"
                icon={<GoogleIcon className="size-5" />}
                loading={busyProvider === 'google'}
                disabled={disabled || isBusy}
                onClick={() => void handleClick('google')}
            />
            <SocialButton
                label="Continue with Apple"
                icon={<AppleIcon className="size-5" />}
                loading={busyProvider === 'apple'}
                disabled={disabled || isBusy}
                onClick={() => void handleClick('apple')}
                variant="default"
                className="border border-black bg-black text-white shadow-sm hover:border-neutral-800 hover:bg-neutral-800 hover:text-white dark:border-white dark:bg-white dark:text-black dark:hover:border-neutral-200 dark:hover:bg-neutral-100 dark:hover:text-black"
            />
        </div>
    );
}

function SocialButton({
    label,
    icon,
    loading,
    disabled,
    onClick,
    variant = 'outline',
    className,
}: {
    label: string;
    icon: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
    variant?: 'outline' | 'default';
    className?: string;
}) {
    return (
        <Button
            type="button"
            variant={variant}
            disabled={disabled || loading}
            onClick={onClick}
            className={cn(
                'h-11 w-full justify-center gap-2.5 font-medium',
                variant === 'outline' &&
                    'border-border/80 bg-background/80 shadow-sm hover:bg-muted hover:text-foreground',
                className,
            )}
        >
            {loading ? (
                <Loader2 className="size-5 animate-spin" />
            ) : (
                icon
            )}
            {label}
        </Button>
    );
}
