'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startCheckout } from '@/lib/checkout';
import { apiFetch, getCart, resolveListingImage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/currency-formatter';
import { ShoppingBag, Trash2 } from 'lucide-react';

type CartRow = {
    id: string;
    listing_id?: string;
    listing?: {
        id: string;
        title: string;
        price?: number;
        image_url?: string | null;
        image_path?: string | null;
    };
};

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

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

    const total = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + (item.listing?.price ?? 0),
                0,
            ),
        [items],
    );

    const remove = async (listingId: string) => {
        await apiFetch(`/api/listings/${listingId}/cart`, { method: 'DELETE' });
        await load();
    };

    return (
        <div className="mx-auto max-w-2xl">
            <PageHeader
                title="Cart"
                description={
                    items.length > 0
                        ? `${items.length} item${items.length === 1 ? '' : 's'} ready for checkout`
                        : 'Review items before you checkout'
                }
            />

            {loading || authLoading ? (
                <PageLoading label="Loading your cart…" />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : items.length === 0 ? (
                <EmptyState
                    type="generic"
                    title="Your cart is empty"
                    description="Browse listings and tap Add to cart when you find something you like."
                    actionLabel="Browse listings"
                    actionHref="/"
                />
            ) : (
                <div className="space-y-6">
                    <ul className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
                        {items.map((item, index) => {
                            const listing = item.listing;
                            const lid = listing?.id || item.listing_id || '';
                            const imageSrc = listing
                                ? resolveListingImage(listing)
                                : null;
                            return (
                                <li
                                    key={item.id}
                                    className={
                                        index > 0
                                            ? 'border-t border-border/60'
                                            : ''
                                    }
                                >
                                    <div className="flex items-center gap-4 p-4">
                                        <Link
                                            href={`/listings/${lid}`}
                                            className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted/50"
                                        >
                                            {imageSrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={imageSrc}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <span className="flex size-full items-center justify-center text-muted-foreground">
                                                    <ShoppingBag className="size-5" />
                                                </span>
                                            )}
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/listings/${lid}`}
                                                className="line-clamp-2 font-medium hover:text-primary"
                                            >
                                                {listing?.title || 'Listing'}
                                            </Link>
                                            {listing?.price != null ? (
                                                <p className="mt-1 text-sm font-semibold text-primary">
                                                    <CurrencyFormatter
                                                        amount={listing.price}
                                                    />
                                                </p>
                                            ) : null}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-muted-foreground hover:text-destructive"
                                            aria-label="Remove from cart"
                                            onClick={() => void remove(lid)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                Estimated total
                            </span>
                            <span className="text-xl font-semibold">
                                <CurrencyFormatter amount={total} />
                            </span>
                        </div>
                        <Button
                            className="mt-4 w-full shadow-sm"
                            size="lg"
                            disabled={checkingOut}
                            onClick={() => {
                                setCheckingOut(true);
                                void startCheckout(router)
                                    .catch((e) => {
                                        setError(
                                            e instanceof Error
                                                ? e.message
                                                : 'Checkout failed',
                                        );
                                    })
                                    .finally(() => setCheckingOut(false));
                            }}
                        >
                            {checkingOut ? 'Starting checkout…' : 'Proceed to checkout'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
