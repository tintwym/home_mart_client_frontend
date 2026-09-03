'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getOrders } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import {
    BackLink,
    PageError,
    PageHeader,
    PageLoading,
} from '@/components/page-kit';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/currency-formatter';
import { cn } from '@/lib/utils';

type OrderItem = {
    listing?: { title?: string } | null;
};

type Order = {
    id: string;
    status?: string;
    total?: number;
    created_at?: string;
    listing?: { title?: string };
    items?: OrderItem[];
};

function orderTitle(o: Order): string {
    const fromItems = o.items
        ?.map((i) => i.listing?.title)
        .filter(Boolean) as string[] | undefined;
    if (fromItems && fromItems.length > 0) {
        if (fromItems.length === 1) return fromItems[0]!;
        return `${fromItems[0]} +${fromItems.length - 1} more`;
    }
    return o.listing?.title || `Order ${o.id.slice(0, 8)}…`;
}

function canMarkComplete(status?: string) {
    return status === 'paid' || status === 'arranged';
}

function statusTone(status?: string) {
    switch (status) {
        case 'paid':
        case 'completed':
            return 'bg-primary/10 text-primary';
        case 'arranged':
        case 'pending':
            return 'bg-secondary/30 text-secondary-foreground';
        case 'cancelled':
            return 'bg-muted text-muted-foreground';
        default:
            return 'bg-muted/60 text-muted-foreground';
    }
}

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
            router.replace(loginHref('/settings/orders'));
            return;
        }
        if (user) void load();
    }, [authLoading, user, router]);

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader
                as="h1"
                title="Orders"
                description="Track purchases and completed sales"
            />
            {loading || authLoading ? (
                <PageLoading label="Loading orders…" />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : orders.length === 0 ? (
                <EmptyState
                    type="generic"
                    title="No orders yet"
                    description="When you buy or sell something, your orders will show up here."
                    actionLabel="Browse listings"
                    actionHref="/"
                />
            ) : (
                <ul className="space-y-3">
                    {orders.map((o) => (
                        <li
                            key={o.id}
                            className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-medium">
                                        {orderTitle(o)}
                                    </div>
                                    {o.total != null ? (
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            <CurrencyFormatter amount={o.total} />
                                        </p>
                                    ) : null}
                                    {o.created_at ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {new Date(o.created_at).toLocaleString()}
                                        </p>
                                    ) : null}
                                </div>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                                        statusTone(o.status),
                                    )}
                                >
                                    {o.status || 'unknown'}
                                </span>
                            </div>
                            {canMarkComplete(o.status) ? (
                                <Button
                                    size="sm"
                                    className="mt-3"
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
