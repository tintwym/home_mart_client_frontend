'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function C2CCheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
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
                title="Cash / meetup checkout"
                description="Arrange a customer-to-customer handoff for your cart."
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
                                await apiFetch('/api/checkout', {
                                    method: 'POST',
                                    body: { method: 'c2c' },
                                });
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
