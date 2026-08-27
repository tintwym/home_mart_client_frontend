'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getCart } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/currency-formatter';

type CartRow = {
    id: string;
    listing_id?: string;
    listing?: {
        id: string;
        title: string;
        price?: number;
        image_url?: string | null;
    };
};

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getCart();
            setItems((res.items as CartRow[]) ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load cart');
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

    const remove = async (listingId: string) => {
        await apiFetch(`/api/listings/${listingId}/cart`, { method: 'DELETE' });
        await load();
    };

    return (
        <div>
            <PageHeader title="Cart" description="Items ready for checkout" />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Your cart is empty.{' '}
                    <Link href="/" className="underline">
                        Browse listings
                    </Link>
                </p>
            ) : (
                <div className="space-y-4">
                    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                        {items.map((item) => {
                            const listing = item.listing;
                            const lid = listing?.id || item.listing_id || '';
                            return (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <Link
                                            href={`/listings/${lid}`}
                                            className="font-medium hover:underline"
                                        >
                                            {listing?.title || 'Listing'}
                                        </Link>
                                        {listing?.price != null ? (
                                            <p className="text-sm text-muted-foreground">
                                                <CurrencyFormatter
                                                    amount={listing.price}
                                                />
                                            </p>
                                        ) : null}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void remove(lid)}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href="/checkout/stripe">Stripe checkout</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/checkout/myanmar">Myanmar pay</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/checkout/vietnam">Vietnam pay</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href="/checkout/c2c">Cash / meetup</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
