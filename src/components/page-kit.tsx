'use client';

import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { AuthPanel } from '@/components/auth/auth-panel';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner />
            <p className="text-sm">{label}</p>
        </div>
    );
}

export function PageError({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-destructive">{message}</p>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-sm font-medium text-primary underline"
                >
                    Retry
                </button>
            ) : null}
        </div>
    );
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {action}
        </div>
    );
}

export function AuthCard({
    title,
    description,
    children,
    footer,
    showClose = true,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showClose?: boolean;
}) {
    return (
        <AuthPanel
            title={title}
            description={description}
            footer={footer}
            showClose={showClose}
        >
            {children}
        </AuthPanel>
    );
}

export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
            ← {label}
        </Link>
    );
}
