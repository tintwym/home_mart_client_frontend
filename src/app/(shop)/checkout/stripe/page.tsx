'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock } from 'lucide-react';
import { startStripeCheckout } from '@/lib/checkout';
import { getCart } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { ShopTrustStrip } from '@/components/shop-trust-strip';
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
            router.replace(
                loginHref(
                    orderId
                        ? `/checkout/stripe?orderId=${encodeURIComponent(orderId)}`
                        : '/checkout/stripe',
                ),
            );
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
    }, [authLoading, user, router, orderId]);

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
                title="Pay securely"
                description="Complete your purchase with Stripe — cards accepted worldwide."
            />

            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <CreditCard className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">Order ready</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {orderId
                                ? `Order ${orderId.slice(0, 8)}…`
                                : 'No order yet — start from your cart.'}
                            {orderId && itemCount > 0
                                ? ` · ${itemCount} item${itemCount === 1 ? '' : 's'} still in cart`
                                : null}
                        </p>
                    </div>
                </div>

                {error ? (
                    <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                ) : null}

                <Button
                    className="mt-5 w-full gap-2 shadow-sm"
                    size="lg"
                    disabled={busy || !orderId}
                    onClick={() => void start()}
                >
                    <Lock className="size-4" aria-hidden />
                    {busy ? 'Redirecting to Stripe…' : 'Continue to Stripe'}
                </Button>

                <ShopTrustStrip
                    className="mt-4"
                    message="Encrypted payment · You’ll return here after paying"
                />

                {!orderId ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                        <Link
                            href="/cart"
                            className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                            Back to cart
                        </Link>{' '}
                        to create an order first.
                    </p>
                ) : null}
            </div>
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
