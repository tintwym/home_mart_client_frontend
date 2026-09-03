'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, getToken } from '@/lib/api';
import { useAuthOptional } from '@/lib/auth';
import { useSharedProps } from '@/lib/bootstrap';

export type CartItem = {
    id: string;
    listing_id?: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        condition?: string;
        user?: { id: string; name: string; region?: string | null };
    } | null;
};

const getInitialLocalCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('homemart_cart');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export function useCart() {
    const shared = useSharedProps();
    const authCtx = useAuthOptional();
    const user = authCtx?.user ?? shared.auth?.user ?? null;
    const [items, setItems] = useState<CartItem[]>(getInitialLocalCart);
    const [isLoading, setIsLoading] = useState(false);
    const mergedGuestRef = useRef(false);

    const saveLocalCart = useCallback((cartItems: CartItem[]) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('homemart_cart', JSON.stringify(cartItems));
        } catch {
            /* ignore */
        }
    }, []);

    const bumpBootstrap = useCallback(() => {
        (
            globalThis as unknown as {
                __hmBootstrapRefresh?: () => void;
            }
        ).__hmBootstrapRefresh?.();
    }, []);

    const fetchItems = useCallback(async () => {
        if (!user || !getToken()) return;
        setIsLoading(true);
        try {
            const data = await apiFetch<{ items: CartItem[] }>('/api/cart');
            const next = data.items ?? [];
            setItems(next);
            saveLocalCart(next);
            bumpBootstrap();
        } catch {
            /* ignore */
        } finally {
            setIsLoading(false);
        }
    }, [user, saveLocalCart, bumpBootstrap]);

    useEffect(() => {
        if (!user) {
            mergedGuestRef.current = false;
            return;
        }
        if (mergedGuestRef.current) return;
        mergedGuestRef.current = true;

        let cancelled = false;
        (async () => {
            const guest = getInitialLocalCart();
            const guestIds = [
                ...new Set(
                    guest
                        .map((g) => g.listing?.id || g.listing_id)
                        .filter(Boolean),
                ),
            ] as string[];

            for (const listingId of guestIds) {
                if (cancelled) return;
                try {
                    await apiFetch(`/api/listings/${listingId}/cart`, {
                        method: 'POST',
                        body: {},
                    });
                } catch {
                    /* skip */
                }
            }
            if (!cancelled) await fetchItems();
        })();

        return () => {
            cancelled = true;
        };
    }, [user, fetchItems]);

    const addItem = useCallback(
        async (listing: NonNullable<CartItem['listing']>) => {
            if (!user) {
                const next = [
                    ...items.filter((i) => i.listing?.id !== listing.id),
                    {
                        id: `local-${listing.id}`,
                        listing,
                    },
                ];
                setItems(next);
                saveLocalCart(next);
                return;
            }
            await apiFetch(`/api/listings/${listing.id}/cart`, {
                method: 'POST',
                body: {},
            });
            await fetchItems();
        },
        [user, items, saveLocalCart, fetchItems],
    );

    const removeItem = useCallback(
        async (listingId: string) => {
            if (!listingId) return;
            if (!user) {
                const next = items.filter(
                    (i) => (i.listing?.id || i.listing_id) !== listingId,
                );
                setItems(next);
                saveLocalCart(next);
                return;
            }
            await apiFetch(`/api/listings/${listingId}/cart`, {
                method: 'DELETE',
            });
            await fetchItems();
        },
        [user, items, saveLocalCart, fetchItems],
    );

    return {
        items,
        isLoading,
        fetchItems,
        refresh: fetchItems,
        addItem,
        addToCart: (listingId: string) =>
            apiFetch(`/api/listings/${listingId}/cart`, {
                method: 'POST',
                body: {},
            }).then(() => fetchItems()),
        removeItem,
        removeFromCart: removeItem,
        count:
            user != null
                ? (shared.auth?.cartListingIds?.length ??
                  shared.auth?.cartCount ??
                  items.length)
                : items.length,
    };
}
