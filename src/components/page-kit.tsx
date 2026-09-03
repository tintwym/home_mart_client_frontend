'use client';

import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { AuthPanel } from '@/components/auth/auth-panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
    return (
        <div className="flex min-h-[32vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 py-12 text-muted-foreground">
            <Spinner />
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-card"
                >
                    <div className="aspect-square animate-pulse bg-muted/50" />
                    <div className="space-y-2.5 p-3.5">
                        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/70" />
                        <div className="h-3.5 w-full animate-pulse rounded bg-muted/70" />
                        <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted/70" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
                    </div>
                </div>
            ))}
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
        <div className="flex min-h-[32vh] flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <p className="max-w-sm text-sm text-destructive">{message}</p>
            {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Try again
                </Button>
            ) : null}
        </div>
    );
}

export function PageHeader({
    title,
    description,
    action,
    as: Heading = 'h1',
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    as?: 'h1' | 'h2';
}) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <Heading
                    className={cn(
                        'font-display font-semibold tracking-tight',
                        Heading === 'h1' ? 'text-2xl' : 'text-xl',
                    )}
                >
                    {title}
                </Heading>
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
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            <span aria-hidden>←</span> {label}
        </Link>
    );
}
