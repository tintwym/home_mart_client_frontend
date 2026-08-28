'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useCloseAuthModal } from '@/hooks/use-close-auth-modal';
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
    const close = useCloseAuthModal();

    return (
        <div
            className={cn(
                'relative max-h-[min(90dvh,680px)] overflow-y-auto rounded-2xl border border-primary/15 bg-card/95 p-5 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-card/85 sm:p-6',
                'ring-1 ring-white/40 dark:ring-white/10',
                className,
            )}
        >
            {showClose ? (
                <button
                    type="button"
                    onClick={close}
                    className="absolute top-3.5 right-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-background/60 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </button>
            ) : null}

            <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <AppLogoIcon className="size-9" />
                </div>
            </div>

            <div className="mt-4 text-center">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="mt-4 space-y-4">{children}</div>

            {footer ? (
                <div className="mt-4 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

export function AuthDivider({ label = 'or continue with email' }: { label?: string }) {
    return (
        <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border/80" />
            <span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <div className="h-px flex-1 bg-border/80" />
        </div>
    );
}
