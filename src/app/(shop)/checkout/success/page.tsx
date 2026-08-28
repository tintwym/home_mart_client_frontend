'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmStripeSession } from '@/lib/checkout';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

function CheckoutSuccessInner() {
    const { user, loading: authLoading } = useAuth();
    const { refresh } = useBootstrap();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace('/login');
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

    return (
        <div className="mx-auto max-w-md text-center">
            <PageHeader
                title={error ? 'Payment issue' : 'Payment successful'}
                description={
                    error ??
                    message ??
                    'Your order has been placed.'
                }
            />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button asChild>
                    <Link href="/orders">View orders</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Continue shopping</Link>
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <CheckoutSuccessInner />
        </Suspense>
    );
}
