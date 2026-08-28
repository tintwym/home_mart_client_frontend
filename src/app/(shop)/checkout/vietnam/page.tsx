'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { arrangeMeetup, submitLocalPayment } from '@/lib/checkout';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { BackLink, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VietnamCheckoutPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <VietnamCheckoutInner />
        </Suspense>
    );
}

function VietnamCheckoutInner() {
    const { user, loading: authLoading } = useAuth();
    const { refresh } = useBootstrap();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') ?? '';
    const [method, setMethod] = useState('momo');
    const [identifier, setIdentifier] = useState('');
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
                <PageHeader title="Vietnam payment" />
                <p className="text-sm text-destructive">
                    Missing order. Start checkout from your cart.
                </p>
                <Button className="mt-4" asChild>
                    <a href="/cart">Back to cart</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md">
            <BackLink href="/cart" label="Cart" />
            <PageHeader
                title="Vietnam payment"
                description="Submit local payment details for your order."
            />
            {done ? (
                <p className="text-sm text-primary">
                    Payment submitted. We will confirm shortly.
                </p>
            ) : (
                <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        setError(null);
                        try {
                            await submitLocalPayment(
                                'VN',
                                orderId,
                                method,
                                identifier,
                            );
                            await refresh();
                            setDone(true);
                        } catch (err) {
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : 'Payment failed',
                            );
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    <div className="space-y-2">
                        <Label htmlFor="method">Method</Label>
                        <select
                            id="method"
                            className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <option value="momo">MoMo</option>
                            <option value="zalo_pay">ZaloPay</option>
                            <option value="viet_qr">VietQR</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Transaction reference</Label>
                        <Input
                            id="identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>
                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                    <Button type="submit" disabled={busy} className="w-full">
                        {busy ? 'Submitting…' : 'Submit payment'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            setError(null);
                            try {
                                await arrangeMeetup('VN', orderId);
                                await refresh();
                                setDone(true);
                            } catch (err) {
                                setError(
                                    err instanceof Error
                                        ? err.message
                                        : 'Failed',
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        Arrange meetup instead
                    </Button>
                </form>
            )}
        </div>
    );
}
