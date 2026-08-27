'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function PaymentSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [methods, setMethods] = useState<unknown[]>([]);
    const [local, setLocal] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [stripe, loc] = await Promise.all([
                apiFetch('/api/payment/methods').catch(() => ({ data: [] })),
                apiFetch('/api/payment/local').catch(() => ({ data: [] })),
            ]);
            const stripeRows = Array.isArray(stripe)
                ? stripe
                : ((stripe as { data?: unknown[]; methods?: unknown[] }).data ??
                  (stripe as { methods?: unknown[] }).methods ??
                  []);
            const localRows = Array.isArray(loc)
                ? loc
                : ((loc as { data?: unknown[]; methods?: unknown[] }).data ??
                  (loc as { methods?: unknown[] }).methods ??
                  []);
            setMethods(stripeRows);
            setLocal(localRows);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }
        if (user) void load();
    }, [authLoading, user, router]);

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader
                title="Payment methods"
                description="Cards and local payment accounts"
            />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : (
                <div className="space-y-6">
                    <section>
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                            Stripe cards ({methods.length})
                        </h2>
                        {methods.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No cards on file.
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {methods.map((m, i) => (
                                    <li
                                        key={i}
                                        className="rounded-md border border-border p-3"
                                    >
                                        {JSON.stringify(m)}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button
                            className="mt-3"
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const res = await apiFetch<{
                                        client_secret?: string;
                                    }>('/api/payment/setup-intent', {
                                        method: 'POST',
                                        body: {},
                                    });
                                    alert(
                                        res.client_secret
                                            ? 'Setup intent created — wire Stripe Elements to complete.'
                                            : 'Setup intent requested',
                                    );
                                } catch (e) {
                                    alert(
                                        e instanceof Error
                                            ? e.message
                                            : 'Failed',
                                    );
                                }
                            }}
                        >
                            Add card (setup intent)
                        </Button>
                    </section>
                    <section>
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                            Local methods ({local.length})
                        </h2>
                        {local.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No local payment methods.
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {local.map((m, i) => (
                                    <li
                                        key={i}
                                        className="rounded-md border border-border p-3"
                                    >
                                        {JSON.stringify(m)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
