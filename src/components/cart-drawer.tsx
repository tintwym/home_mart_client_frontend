import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Trash2, Check, ArrowRight } from 'lucide-react';
import { Link, router } from '@/lib/app-client'
import { useSharedProps } from '@/lib/bootstrap';
import { useCurrency } from '@/hooks/use-currency';
import { useCart } from '@/hooks/use-cart';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

const CONDITION_KEYS: Record<string, string> = {
    new: 'cart.condition_new',
    like_new: 'cart.condition_like_new',
    good: 'cart.condition_good',
    fair: 'cart.condition_fair',
};

export function CartDrawer() {
    const { auth } = useSharedProps();
    const { formatPrice, formatAmount, toDisplayAmount } = useCurrency();
    const { t } = useTranslations();
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

    const handleClose = () => setIsOpen(false);

    const handleCheckout = () => {
        router.post('/checkout');
    };

    const orderTotal = items.reduce(
        (sum, item) =>
            sum +
            toDisplayAmount(item.listing.price, item.listing.user?.region),
        0,
    );

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
                        className="fixed top-0 right-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="size-5 text-primary" />
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {t('cart_drawer.your_order')}
                                </h2>
                                {items.length > 0 && (
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        {items.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 scrollbar-thin overflow-y-auto p-5">
                            {isLoading && items.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center gap-2 text-zinc-500">
                                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-xs">
                                        {t('cart_drawer.loading')}
                                    </span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-4 rounded-full bg-zinc-50 p-4 dark:bg-zinc-900">
                                        <ShoppingCart className="size-10 text-zinc-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                                        {t('cart_drawer.empty_title')}
                                    </h3>
                                    <p className="mt-1 max-w-xs text-sm text-zinc-500">
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
                                        const imgUrl =
                                            item.listing.image_url ??
                                            item.listing.image_path;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/20"
                                            >
                                                <Link
                                                    href={`/listings/${item.listing.id}`}
                                                    onClick={handleClose}
                                                    className="size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                                                >
                                                    {imgUrl ? (
                                                        <img
                                                            src={imgUrl}
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-xs text-zinc-400">
                                                            —
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-1">
                                                            <h4 className="truncate text-xs font-bold text-zinc-900 hover:underline dark:text-zinc-100">
                                                                <Link
                                                                    href={`/listings/${item.listing.id}`}
                                                                    onClick={
                                                                        handleClose
                                                                    }
                                                                >
                                                                    {
                                                                        item
                                                                            .listing
                                                                            .title
                                                                    }
                                                                </Link>
                                                            </h4>
                                                            <button
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        item
                                                                            .listing
                                                                            .id,
                                                                    )
                                                                }
                                                                className="p-0.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                                                                title={t(
                                                                    'cart.remove',
                                                                )}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500">
                                                            {CONDITION_KEYS[
                                                                item.listing
                                                                    .condition ??
                                                                    ''
                                                            ]
                                                                ? t(
                                                                      CONDITION_KEYS[
                                                                          item
                                                                              .listing
                                                                              .condition ??
                                                                              ''
                                                                      ],
                                                                  )
                                                                : item.listing
                                                                      .condition}
                                                        </p>
                                                    </div>

                                                    <div className="mt-1 flex items-center justify-between text-xs">
                                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                            {formatPrice(
                                                                item.listing
                                                                    .price,
                                                                item.listing
                                                                    .user
                                                                    ?.region,
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                                                            <Check className="size-3 text-green-500" />
                                                            {t('cart.in_stock')}
                                                        </span>
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
                            <div className="space-y-4 border-t border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/10">
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-zinc-500">
                                        <span>{t('cart.subtotal')}</span>
                                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                            {formatAmount(orderTotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-zinc-200 pt-2.5 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                                        <span>{t('cart.order_total')}</span>
                                        <span>{formatAmount(orderTotal)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-950 py-5.5 text-sm font-bold text-white shadow-md hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                                >
                                    {t('cart_drawer.proceed')}
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
