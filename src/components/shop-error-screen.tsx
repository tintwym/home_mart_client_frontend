'use client';

import Link from 'next/link';
import {
    Home,
    LogIn,
    RefreshCw,
    SearchX,
    ShieldAlert,
    ShieldOff,
    Timer,
    WifiOff,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginHref } from '@/lib/auth-redirect';
import {
    SHOP_ERROR_COPY,
    type ShopErrorKind,
} from '@/lib/http-errors';

const ICONS: Record<ShopErrorKind, typeof SearchX> = {
    unauthorized: LogIn,
    forbidden: ShieldOff,
    'not-found': SearchX,
    'rate-limit': Timer,
    error: ShieldAlert,
    unavailable: WifiOff,
};

type ShopErrorScreenProps = {
    kind: ShopErrorKind;
    onRetry?: () => void;
    returnTo?: string;
};

export function ShopErrorScreen({
    kind,
    onRetry,
    returnTo,
}: ShopErrorScreenProps) {
    const copy = SHOP_ERROR_COPY[kind];
    const Icon = ICONS[kind] ?? Wrench;
    const showRetry = Boolean(copy.retry && onRetry);

    return (
        <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-8" aria-hidden />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {copy.code}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                {showRetry ? (
                    <Button onClick={onRetry} className="gap-1.5">
                        <RefreshCw className="size-4" />
                        Try again
                    </Button>
                ) : null}
                {copy.signIn ? (
                    <Button asChild className="gap-1.5">
                        <Link href={loginHref(returnTo)}>
                            <LogIn className="size-4" />
                            Sign in
                        </Link>
                    </Button>
                ) : null}
                <Button
                    variant={showRetry || copy.signIn ? 'outline' : 'default'}
                    asChild
                >
                    <Link href="/" className="gap-1.5">
                        <Home className="size-4" />
                        Back to home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
