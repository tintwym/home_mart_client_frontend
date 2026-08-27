'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getCart } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function StripeCheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
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
        setBusy(true);
        setError(null);
        try {
            const res = await apiFetch<{
                url?: string;
                checkout_url?: string;
            }>('/api/checkout/stripe', { method: 'POST', body: {} });
            const url = res.url || res.checkout_url;
            if (url) window.location.href = url;
            else setError('No checkout URL returned');
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
                disabled={busy || itemCount === 0}
                onClick={() => void start()}
            >
                {busy ? 'Redirecting…' : 'Pay with Stripe'}
            </Button>
        </div>
    );
}
