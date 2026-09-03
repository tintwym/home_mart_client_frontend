'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { confirmStripeSession } from '@/lib/checkout';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { useBootstrap } from '@/lib/bootstrap';
import { PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

function CheckoutSuccessInner() {
    const { user, loading: authLoading } = useAuth();
    const { refresh } = useBootstrap();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const reduceMotion = useReducedMotion();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace(
                loginHref(
                    sessionId
                        ? `/checkout/success?session_id=${encodeURIComponent(sessionId)}`
                        : '/checkout/success',
                ),
            );
            return;
        }
        if (!sessionId) {
            setError('Missing Stripe session id.');
            setBusy(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const res = await confirmStripeSession(sessionId);
                if (cancelled) return;
                setMessage(res.message ?? 'Payment successful.');
                await refresh();
            } catch (e) {
                if (cancelled) return;
                setError(
                    e instanceof Error
                        ? e.message
                        : 'Unable to confirm payment.',
                );
            } finally {
                if (!cancelled) setBusy(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authLoading, user, sessionId, router, refresh]);

    if (authLoading || busy) return <PageLoading />;

    const failed = Boolean(error);

    return (
        <motion.div
            className="mx-auto max-w-md text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
                    failed
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/12 text-primary'
                }`}
            >
                {failed ? (
                    <Package className="size-8" aria-hidden />
                ) : (
                    <CheckCircle2 className="size-8" aria-hidden />
                )}
            </div>

            <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
                {failed ? 'Payment issue' : 'You’re all set'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {error ??
                    message ??
                    'Your order has been placed. We’ll keep you updated.'}
            </p>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button asChild className="gap-1.5">
                    <Link href="/settings/orders">
                        <Package className="size-4" />
                        View orders
                    </Link>
                </Button>
                <Button variant="outline" asChild className="gap-1.5">
                    <Link href="/">
                        <ShoppingBag className="size-4" />
                        Continue shopping
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <CheckoutSuccessInner />
        </Suspense>
    );
}
