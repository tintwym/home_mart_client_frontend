'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startCheckout } from '@/lib/checkout';
import { apiFetch, getCart, resolveListingImage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { EmptyState } from '@/components/empty-state';
import { ShopTrustStrip } from '@/components/shop-trust-strip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
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
    const { toast } = useToast();
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
            router.replace(loginHref('/cart'));
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
        if (!listingId) return;
        try {
            await apiFetch(`/api/listings/${listingId}/cart`, {
                method: 'DELETE',
            });
            await load();
            (
                globalThis as unknown as {
                    __hmBootstrapRefresh?: () => void;
                }
            ).__hmBootstrapRefresh?.();
        } catch (e) {
            toast({
                title: 'Could not remove item',
                description:
                    e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
            });
        }
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
                    description="Browse listings and tap the cart button when you find something you like."
                    actionLabel="Browse listings"
                    actionHref="/"
                />
            ) : (
                <div className="space-y-6">
                    <ul className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs divide-y divide-border/60">
                        {items.map((item) => {
                            const listing = item.listing;
                            const lid = listing?.id || item.listing_id || '';
                            const imageSrc = listing
                                ? resolveListingImage(listing)
                                : null;
                            return (
                                <li key={item.id}>
                                    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/20">
                                        <Link
                                            href={`/listings/${lid}`}
                                            className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted/50 ring-1 ring-border/60"
                                        >
                                            {imageSrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={imageSrc}
                                                    alt={listing?.title || 'Listing'}
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
                                            disabled={!lid}
                                            onClick={() => void remove(lid)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 rounded-2xl border border-primary/20 bg-card/95 p-5 shadow-lg backdrop-blur-md lg:static lg:shadow-xs">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                Estimated total
                            </span>
                            <span className="text-xl font-semibold tabular-nums">
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
                                        toast({
                                            title: 'Checkout failed',
                                            description:
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Please try again.',
                                            variant: 'destructive',
                                        });
                                    })
                                    .finally(() => setCheckingOut(false));
                            }}
                        >
                            {checkingOut
                                ? 'Starting checkout…'
                                : 'Proceed to checkout'}
                        </Button>
                        <ShopTrustStrip
                            className="mt-3"
                            message="Secure checkout · Buyer protection on eligible orders"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
