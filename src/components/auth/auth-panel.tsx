'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useSharedProps } from '@/lib/bootstrap';
import { cn } from '@/lib/utils';

type AuthPanelProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showClose?: boolean;
    className?: string;
};

export function AuthPanel({
    title,
    description,
    children,
    footer,
    showClose = true,
    className,
}: AuthPanelProps) {
    const { name } = useSharedProps();
    const appName = name || 'Home Mart';

    return (
        <div
            className={cn(
                'relative max-h-[min(90dvh,720px)] overflow-y-auto rounded-2xl border border-primary/15 bg-card/95 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-card/85 sm:p-8',
                'ring-1 ring-white/40 dark:ring-white/10',
                className,
            )}
        >
            {showClose ? (
                <Link
                    href="/"
                    className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-background/50 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </Link>
            ) : null}

            <div className="flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <AppLogoIcon className="size-10" />
                </div>
                <p className="mt-3 text-sm font-semibold tracking-tight text-foreground">
                    {appName}
                </p>
            </div>

            <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="mt-6 space-y-5">{children}</div>

            {footer ? (
                <div className="mt-6 border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

export function AuthDivider({ label = 'or continue with email' }: { label?: string }) {
    return (
        <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border/80" />
            <span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <div className="h-px flex-1 bg-border/80" />
        </div>
    );
}
