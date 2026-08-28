'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MyanmarCheckoutView } from '@/components/checkout/myanmar-checkout-view';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function MyanmarCheckoutPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <MyanmarCheckoutInner />
        </Suspense>
    );
}

function MyanmarCheckoutInner() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') ?? '';

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
                <PageHeader title="Myanmar payment" />
                <p className="text-sm text-destructive">
                    Missing order. Start checkout from your cart.
                </p>
                <Button className="mt-4" asChild>
                    <a href="/cart">Back to cart</a>
                </Button>
            </div>
        );
    }

    return <MyanmarCheckoutView orderId={orderId} />;
}
