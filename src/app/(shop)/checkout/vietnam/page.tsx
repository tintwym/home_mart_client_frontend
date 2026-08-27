'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VietnamCheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [method, setMethod] = useState('momo');
    const [reference, setReference] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    if (!user) {
        if (typeof window !== 'undefined') router.replace('/login');
        return null;
    }

    return (
        <div className="mx-auto max-w-md">
            <BackLink href="/cart" label="Cart" />
            <PageHeader
                title="Vietnam payment"
                description="Submit local payment details for your cart."
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
                            await apiFetch('/api/checkout/vn/pay', {
                                method: 'POST',
                                body: { method, reference },
                            });
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
                            <option value="zalopay">ZaloPay</option>
                            <option value="vietqr">VietQR</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reference">Transaction reference</Label>
                        <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
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
                            try {
                                await apiFetch('/api/checkout/vn/arrange', {
                                    method: 'POST',
                                    body: {},
                                });
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
