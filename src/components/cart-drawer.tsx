'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Trash2, Check, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/app-client';
import { resolveListingImage } from '@/lib/api';
import { startCheckout } from '@/lib/checkout';
import { useSharedProps } from '@/lib/bootstrap';
import { useCurrency } from '@/hooks/use-currency';
import { useCart } from '@/hooks/use-cart';
import { useTranslations } from '@/hooks/use-translations';
import { ShopTrustStrip } from '@/components/shop-trust-strip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const CONDITION_KEYS: Record<string, string> = {
    new: 'cart.condition_new',
    like_new: 'cart.condition_like_new',
    good: 'cart.condition_good',
    fair: 'cart.condition_fair',
};

export function CartDrawer() {
    const router = useRouter();
    const { auth } = useSharedProps();
    const { formatPrice, formatAmount, toDisplayAmount } = useCurrency();
    const { t } = useTranslations();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const { items, isLoading, fetchItems, removeFromCart } = useCart();
    const prevCartCountRef = useRef(auth?.cartListingIds?.length ?? 0);

    // Listen for custom open event
    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            fetchItems();
        };

        window.addEventListener('open-cart-drawer', handleOpen);
        return () => window.removeEventListener('open-cart-drawer', handleOpen);
    }, [fetchItems]);

    // Automatically trigger drawer open when cart count increases (item added)
    useEffect(() => {
        const currentCount = auth?.cartListingIds?.length ?? 0;
        const increased = currentCount > prevCartCountRef.current;
        // Always track the latest count so removals don't leave a stale
        // baseline that re-opens the drawer later.
        prevCartCountRef.current = currentCount;
        if (increased) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                fetchItems();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [auth?.cartListingIds, fetchItems]);

    // Re-fetch when drawer opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                fetchItems();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, fetchItems]);

    const [checkoutBusy, setCheckoutBusy] = useState(false);

    const handleClose = () => setIsOpen(false);

    const handleCheckout = () => {
        setCheckoutBusy(true);
        void startCheckout(router)
            .then(() => handleClose())
            .catch((e) => {
                toast({
                    title: 'Checkout failed',
                    description:
                        e instanceof Error
                            ? e.message
                            : 'Please try again from your cart.',
                    variant: 'destructive',
                });
            })
            .finally(() => setCheckoutBusy(false));
    };

    const handleRemove = async (listingId: string) => {
        try {
            await removeFromCart(listingId);
        } catch (e) {
            toast({
                title: 'Could not remove item',
                description:
                    e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    const orderTotal = items.reduce((sum, item) => {
        if (!item.listing) return sum;
        return (
            sum +
            toDisplayAmount(item.listing.price, item.listing.user?.region)
        );
    }, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
                    />

                    {/* Side panel Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="fixed top-0 right-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-border p-5">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="size-5 text-primary" />
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    {t('cart_drawer.your_order')}
                                </h2>
                                {items.length > 0 && (
                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                                        {items.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 scrollbar-thin overflow-y-auto p-5">
                            {isLoading && items.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-xs">
                                        {t('cart_drawer.loading')}
                                    </span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-4 rounded-full bg-muted/60 p-4">
                                        <ShoppingCart className="size-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t('cart_drawer.empty_title')}
                                    </h3>
                                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                                        {t('cart_drawer.empty_description')}
                                    </p>
                                    <Button
                                        onClick={handleClose}
                                        className="mt-5 rounded-full px-5 py-2 text-xs"
                                    >
                                        {t('cart_drawer.browse')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const listing = item.listing;
                                        const listingId =
                                            listing?.id || item.listing_id || '';
                                        const imgUrl = listing
                                            ? resolveListingImage(listing)
                                            : null;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex gap-4 rounded-2xl border border-border/80 bg-muted/20 p-3"
                                            >
                                                {listingId ? (
                                                    <Link
                                                        href={`/listings/${listingId}`}
                                                        onClick={handleClose}
                                                        className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                                                    >
                                                        {imgUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={imgUrl}
                                                                alt={
                                                                    listing?.title ||
                                                                    'Listing'
                                                                }
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                                                —
                                                            </div>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-xs text-muted-foreground">
                                                        —
                                                    </div>
                                                )}

                                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-1">
                                                            <h4 className="truncate text-sm font-semibold text-foreground hover:underline">
                                                                {listingId ? (
                                                                    <Link
                                                                        href={`/listings/${listingId}`}
                                                                        onClick={
                                                                            handleClose
                                                                        }
                                                                    >
                                                                        {listing?.title ||
                                                                            'Unavailable listing'}
                                                                    </Link>
                                                                ) : (
                                                                    listing?.title ||
                                                                    'Unavailable listing'
                                                                )}
                                                            </h4>
                                                            {listingId ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        void handleRemove(
                                                                            listingId,
                                                                        )
                                                                    }
                                                                    className="p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                                                                    title={t(
                                                                        'cart.remove',
                                                                    )}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {!listing
                                                                ? 'This item is no longer available'
                                                                : CONDITION_KEYS[
                                                                        listing.condition ??
                                                                            ''
                                                                    ]
                                                                  ? t(
                                                                        CONDITION_KEYS[
                                                                            listing.condition ??
                                                                                ''
                                                                        ],
                                                                    )
                                                                  : listing.condition}
                                                        </p>
                                                    </div>

                                                    <div className="mt-1 flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-foreground">
                                                            {listing
                                                                ? formatPrice(
                                                                      listing.price,
                                                                      listing
                                                                          .user
                                                                          ?.region,
                                                                  )
                                                                : '—'}
                                                        </span>
                                                        {listing ? (
                                                            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                                <Check className="size-3 text-primary" />
                                                                {t(
                                                                    'cart.in_stock',
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer Summary */}
                        {items.length > 0 && (
                            <div className="space-y-4 border-t border-border bg-muted/20 p-5">
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>{t('cart.subtotal')}</span>
                                        <span className="font-medium text-foreground">
                                            {formatAmount(orderTotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-2.5 text-sm font-bold text-foreground">
                                        <span>{t('cart.order_total')}</span>
                                        <span>{formatAmount(orderTotal)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    disabled={checkoutBusy}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl py-5.5 text-sm font-bold shadow-md"
                                >
                                    {checkoutBusy
                                        ? t('cart_drawer.loading')
                                        : t('cart_drawer.proceed')}
                                    <ArrowRight className="size-4" />
                                </Button>
                                <ShopTrustStrip
                                    className="justify-center"
                                    message="Secure checkout · Buyer protection on eligible orders"
                                />
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
