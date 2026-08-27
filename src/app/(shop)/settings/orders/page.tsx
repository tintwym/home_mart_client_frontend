'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getOrders } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

type Order = {
    id: string;
    status?: string;
    total?: number;
    created_at?: string;
    listing?: { title?: string };
};

export default function OrdersSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOrders();
            const rows = Array.isArray(res)
                ? res
                : ((res as { data?: Order[]; orders?: Order[] }).data ??
                  (res as { orders?: Order[] }).orders ??
                  []);
            setOrders(rows as Order[]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load orders');
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
            <PageHeader title="Orders" />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
                <ul className="space-y-3">
                    {orders.map((o) => (
                        <li
                            key={o.id}
                            className="rounded-xl border border-border bg-card p-4"
                        >
                            <div className="font-medium">
                                {o.listing?.title || `Order ${o.id}`}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {o.status || 'unknown'}
                                {o.created_at ? ` · ${o.created_at}` : ''}
                            </p>
                            {o.status &&
                            !['completed', 'cancelled'].includes(o.status) ? (
                                <Button
                                    size="sm"
                                    className="mt-2"
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            await apiFetch(
                                                `/api/orders/${o.id}/complete`,
                                                { method: 'POST', body: {} },
                                            );
                                            await load();
                                        } catch (e) {
                                            alert(
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Failed',
                                            );
                                        }
                                    }}
                                >
                                    Mark complete
                                </Button>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
