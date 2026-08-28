'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { arrangeMeetup } from '@/lib/checkout';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function C2CCheckoutPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <C2CCheckoutInner />
        </Suspense>
    );
}

function C2CCheckoutInner() {
    const { user, loading: authLoading } = useAuth();
    const { refresh } = useBootstrap();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') ?? '';
    const region = (searchParams.get('region') ?? 'MM').toUpperCase();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return authLoading ? <PageLoading /> : null;
    }

    if (!orderId) {
        return (
            <div className="mx-auto max-w-md">
                <BackLink href="/cart" label="Cart" />
                <PageHeader title="Cash / meetup checkout" />
                <p className="text-sm text-destructive">
                    Missing order. Start checkout from your cart.
                </p>
            </div>
        );
    }

    const checkoutRegion = region === 'VN' ? 'VN' : 'MM';

    return (
        <div className="mx-auto max-w-md">
            <BackLink href="/cart" label="Cart" />
            <PageHeader
                title="Cash / meetup checkout"
                description="Arrange a customer-to-customer handoff for your order."
            />
            {done ? (
                <p className="text-sm text-primary">
                    Meetup arranged. Check your orders for details.
                </p>
            ) : (
                <div className="space-y-3">
                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                    <Button
                        className="w-full"
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            setError(null);
                            try {
                                await arrangeMeetup(checkoutRegion, orderId);
                                await refresh();
                                setDone(true);
                            } catch (e) {
                                setError(
                                    e instanceof Error
                                        ? e.message
                                        : 'Checkout failed',
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        {busy ? 'Arranging…' : 'Confirm meetup checkout'}
                    </Button>
                </div>
            )}
        </div>
    );
}
