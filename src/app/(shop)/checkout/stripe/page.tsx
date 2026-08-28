'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startStripeCheckout } from '@/lib/checkout';
import { getCart } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

function StripeCheckoutInner() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') ?? '';
    const [itemCount, setItemCount] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }
        if (!user) return;
        void (async () => {
            try {
                const cart = await getCart();
                setItemCount(cart.items?.length ?? 0);
            } finally {
                setLoading(false);
            }
        })();
    }, [authLoading, user, router]);

    const start = async () => {
        if (!orderId) {
            setError('Missing order. Start checkout from your cart.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const url = await startStripeCheckout(orderId);
            window.location.href = url;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Checkout failed');
        } finally {
            setBusy(false);
        }
    };

    if (authLoading || loading) return <PageLoading />;

    return (
        <div className="mx-auto max-w-md">
            <BackLink href="/cart" label="Cart" />
            <PageHeader
                title="Stripe checkout"
                description={`${itemCount} item(s) in cart`}
            />
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            <Button
                className="w-full"
                disabled={busy || itemCount === 0 || !orderId}
                onClick={() => void start()}
            >
                {busy ? 'Redirecting…' : 'Pay with Stripe'}
            </Button>
            {!orderId ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    Start checkout from your cart to create an order first.
                </p>
            ) : null}
        </div>
    );
}

export default function StripeCheckoutPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <StripeCheckoutInner />
        </Suspense>
    );
}
