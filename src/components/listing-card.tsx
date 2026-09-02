'use client';

import { Link, router } from '@/lib/app-client';
import { resolveListingImage } from '@/lib/api';
import { useBootstrap, useSharedProps } from '@/lib/bootstrap';
import {
    Heart,
    MoreVertical,
    Pencil,
    ShoppingCart,
    Trash2,
    Maximize2,
    X,
    ExternalLink,
    Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/use-translations';
import { CurrencyFormatter } from '@/components/currency-formatter';
import { cn } from '@/lib/utils';

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

function formatRelativeTime(
    dateString: string | undefined,
    t: (key: string, params?: Record<string, string | number>) => string,
): string {
    if (!dateString) return t('time.recently');
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.just_now');
    if (diffMins < 60)
        return diffMins === 1
            ? t('time.minute_ago')
            : t('time.minutes_ago', { count: diffMins });
    if (diffHours < 24)
        return diffHours === 1
            ? t('time.hour_ago')
            : t('time.hours_ago', { count: diffHours });
    if (diffDays < 7)
        return diffDays === 1
            ? t('time.day_ago')
            : t('time.days_ago', { count: diffDays });

    return date.toLocaleDateString();
}

export type ListingCardListing = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    condition: string;
    price: number;
    image_path: string | null;
    image_url?: string | null;
    created_at?: string;
    category?: { id: string; name: string; slug: string } | null;
    user?: {
        id: string;
        name: string;
        avatar?: string;
        seller_type?: string;
        region?: string | null;
    } | null;
    trending_until?: string | null;
    is_sold?: boolean;
    inventory?: number;
    rating?: number;
    reviews_count?: number;
};

type ListingCardProps = {
    listing: ListingCardListing;
};

export function ListingCard({ listing }: ListingCardProps) {
    const { auth } = useSharedProps();
    const { refresh } = useBootstrap();
    const { t } = useTranslations();
    const canEdit = auth?.user && listing.user_id === auth.user.id;
    const isTrending =
        listing.trending_until && new Date(listing.trending_until) > new Date();
    const [imageError, setImageError] = useState(false);
    const [quickViewImageError, setQuickViewImageError] = useState(false);
    const imageSrc = resolveListingImage(listing);
    const showImage = imageSrc && !imageError;

    const isOutOfStock =
        listing.is_sold ||
        (listing.inventory !== undefined && listing.inventory === 0);

    const rating = listing.rating;
    const reviewCount = listing.reviews_count;
    const showRatings =
        rating !== undefined && reviewCount !== undefined && reviewCount > 0;

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const [now] = useState(() => Date.now());
    const isNewArrival =
        !isOutOfStock &&
        !!listing.created_at &&
        now - new Date(listing.created_at).getTime() < SEVEN_DAYS_MS;
    const isBestseller =
        !isOutOfStock &&
        showRatings &&
        rating !== undefined &&
        rating >= 4.7 &&
        reviewCount !== undefined &&
        reviewCount >= 20;

    const { toast } = useToast();
    const isFavorite =
        auth?.user && auth.favoriteListingIds?.includes(listing.id);

    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Lock body scroll and allow Escape to close while the quick view is open
    useEffect(() => {
        if (!isQuickViewOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsQuickViewOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isQuickViewOpen]);

    // Quick view uses only the listing's real image(s)
    const galleryImages = imageSrc ? [imageSrc] : [];
    const primaryImg = imageSrc ?? '';
    const [activeImage, setActiveImage] = useState(primaryImg);

    useEffect(() => {
        setActiveImage(primaryImg);
        setImageError(false);
        setQuickViewImageError(false);
    }, [primaryImg]);

    const handleFavoriteToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth?.user) {
            router.get('/login');
            return;
        }
        router.post(
            `/listings/${listing.id}/favorite`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    void refresh();
                    const favorited = page.props.favorited === true;
                    toast({
                        title: favorited
                            ? 'Added to Favorites'
                            : 'Removed from Favorites',
                        description: `"${listing.title}" has been ${favorited ? 'added to' : 'removed from'} your wishlist.`,
                        variant: 'success',
                    });
                },
            },
        );
    };

    return (
        <article className="group/card relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md dark:border-primary/20 dark:bg-card">
            {/* Product image with sleek premium interactions */}
            <div className="relative aspect-square w-full overflow-hidden bg-muted/60 dark:bg-muted/40">
                <Link
                    href={`/listings/${listing.id}`}
                    className="block size-full"
                >
                    {showImage ? (
                        <img
                            src={imageSrc}
                            alt=""
                            className="size-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-muted/50 text-xs text-muted-foreground">
                            <Maximize2 className="size-5 stroke-[1.5]" />
                            <span>{t('listing.no_image')}</span>
                        </div>
                    )}
                </Link>

                {/* Subtle dark vignette overlay at top for badge legibility */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-black/20 to-transparent" />

                {/* Overlay Badges */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                    <div className="flex flex-col items-start gap-1">
                        <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
                            {formatRelativeTime(listing.created_at, t)}
                        </span>
                        {isTrending && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-chart-1 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                                {t('listing.trending')}
                            </span>
                        )}
                        {isNewArrival && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-chart-4 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent-foreground uppercase shadow-sm">
                                New
                            </span>
                        )}
                        {isBestseller && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-chart-1 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                                Top rated
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {canEdit && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative z-10"
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7.5 shrink-0 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
                                            aria-label={t(
                                                'listing.listing_options',
                                            )}
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="rounded-xl"
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`/listings/${listing.id}/edit`}
                                            >
                                                <Pencil className="mr-2 size-4" />
                                                {t('common.edit')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                if (
                                                    window.confirm(
                                                        t(
                                                            'listing.delete_confirm',
                                                        ),
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/listings/${listing.id}`,
                                                        {
                                                            onSuccess: () => {
                                                                void refresh();
                                                            },
                                                        },
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            {t('common.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>

                {/* Out of Stock / Sold glassmorphic overlay over the center */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                        <span className="rounded-full border border-white/20 bg-black/75 px-4 py-1.5 text-xs font-black tracking-widest text-white uppercase shadow-xl">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Micro-interaction Overlay Controls (fade in on hover) */}
                <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex justify-between opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
                    {/* Floating Expand/Quick-View Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsQuickViewOpen(true);
                        }}
                        className="pointer-events-auto flex size-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:text-primary active:scale-95"
                        aria-label="Quick view"
                    >
                        <Maximize2 className="size-4" />
                    </button>

                    {/* Floating Heart Wishlist Toggle Button */}
                    <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleFavoriteToggle}
                        className="pointer-events-auto flex size-8 items-center justify-center rounded-lg bg-card/95 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Add to favorites"
                    >
                        <Heart
                            className={`size-4 transition-colors ${
                                isFavorite
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground hover:text-primary'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Product details - compact, extremely polished details */}
            <div className="flex min-w-0 flex-1 flex-col gap-2 bg-muted/15 p-3.5">
                {/* Category & Condition Tag Row */}
                <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="truncate font-bold tracking-wider text-muted-foreground uppercase">
                        {listing.category?.name ?? 'General'}
                    </span>
                    <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                            listing.condition === 'new' ||
                            listing.condition === 'like_new'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {CONDITION_KEYS[listing.condition]
                            ? t(CONDITION_KEYS[listing.condition])
                            : listing.condition}
                    </span>
                </div>

                {/* Title & Price blocks */}
                <div className="space-y-1">
                    <Link
                        href={`/listings/${listing.id}`}
                        className="block min-w-0 transition-colors group-hover/card:text-primary"
                    >
                        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                            {listing.title}
                        </h3>
                    </Link>

                    {showRatings && rating !== undefined ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="flex items-center text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const isFilled = i < Math.floor(rating);
                                    const isHalf = !isFilled && i < rating;
                                    return (
                                        <Star
                                            key={i}
                                            className={cn(
                                                'size-3',
                                                isFilled
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : isHalf
                                                      ? 'fill-amber-400/50 text-amber-400'
                                                      : 'text-muted-foreground/40',
                                            )}
                                        />
                                    );
                                })}
                            </div>
                            <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                                {rating.toFixed(1)}{' '}
                                <span className="font-normal text-muted-foreground/70">
                                    ({reviewCount})
                                </span>
                            </span>
                        </div>
                    ) : null}

                    <div className="flex items-baseline justify-between gap-2 pt-0.5">
                        <Link
                            href={`/listings/${listing.id}`}
                            className="inline-block"
                        >
                            <p className="text-base font-extrabold tracking-tight text-foreground">
                                <CurrencyFormatter
                                    amount={listing.price}
                                    sellerRegion={listing.user?.region}
                                />
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Seller & Cart Footer Block */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                            {(listing.user?.name ?? 'U')
                                .slice(0, 1)
                                .toUpperCase()}
                        </div>
                        <span className="truncate font-medium text-muted-foreground">
                            {listing.user?.name ?? t('common.unknown')}
                        </span>
                    </div>

                    {/* Quick Action Buttons: Wishlist & Cart */}
                    <div className="flex shrink-0 items-center gap-1.5">
                        {/* Dedicated Wishlist button to save items for later */}
                        {auth?.user && auth.user.id !== listing.user_id && (
                            <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={handleFavoriteToggle}
                                className={cn(
                                    'inline-flex size-7 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                                    isFavorite
                                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/15'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                                )}
                                title={
                                    isFavorite
                                        ? 'Remove from Wishlist'
                                        : 'Save to Wishlist'
                                }
                            >
                                <Heart
                                    className={cn(
                                        'size-3.5',
                                        isFavorite && 'fill-current',
                                    )}
                                />
                            </button>
                        )}

                        {/* Quick Cart button if business seller */}
                        {auth?.user &&
                            auth.user.id !== listing.user_id &&
                            listing.user?.seller_type === 'business' && (
                                <div className="shrink-0">
                                    {auth.cartListingIds?.includes(
                                        listing.id,
                                    ) ? (
                                        <Link
                                            href="/cart"
                                            className="inline-flex size-7 items-center justify-center rounded-lg bg-muted text-foreground transition-colors hover:bg-muted/80"
                                            title={t('listing.in_cart')}
                                        >
                                            <ShoppingCart className="size-3.5 fill-current" />
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={isOutOfStock}
                                            className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-primary/20 dark:text-primary-foreground"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.post(
                                                    `/listings/${listing.id}/cart`,
                                                    {},
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            void refresh();
                                                            window.dispatchEvent(
                                                                new CustomEvent(
                                                                    'open-cart-drawer',
                                                                ),
                                                            );
                                                            toast({
                                                                title: 'Added to Cart',
                                                                description: `"${listing.title}" has been added to your shopping cart.`,
                                                                variant:
                                                                    'success',
                                                            });
                                                        },
                                                    },
                                                );
                                            }}
                                            title={t('listing.add_to_cart')}
                                        >
                                            <ShoppingCart className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Premium Animated Quick View Modal — rendered in a portal so the
                card's overflow-hidden / hover transform can't clip or trap it */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isQuickViewOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop with sophisticated blur */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsQuickViewOpen(false)}
                                    className="fixed inset-0 bg-foreground/50 backdrop-blur-md"
                                />

                                {/* Modal Container with sliding elastic effect */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                    transition={{
                                        type: 'spring',
                                        duration: 0.45,
                                        bounce: 0.15,
                                    }}
                                    className="relative z-10 grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl md:max-h-[80vh] md:grid-cols-2 md:overflow-hidden"
                                >
                                    {/* Close button with focus/hover feedback */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsQuickViewOpen(false)
                                        }
                                        className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full bg-foreground/70 text-background backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-foreground/85 active:scale-95"
                                        aria-label="Close modal"
                                    >
                                        <X className="size-4.5" />
                                    </button>

                                    {/* Left Column: Premium Carousel View */}
                                    <div className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-muted/30 p-6 md:max-h-full md:border-r md:border-b-0">
                                        <div className="relative flex aspect-square min-h-62.5 flex-1 items-center justify-center overflow-hidden rounded-xl md:aspect-auto md:h-[45vh]">
                                            {activeImage && !quickViewImageError ? (
                                                <motion.img
                                                    key={activeImage}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.98,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{ duration: 0.25 }}
                                                    src={activeImage}
                                                    alt={listing.title}
                                                    className="absolute inset-0 size-full rounded-lg object-contain p-2"
                                                    onError={() =>
                                                        setQuickViewImageError(true)
                                                    }
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <Maximize2 className="size-8 stroke-[1.5]" />
                                                    <span className="text-sm">
                                                        {t('listing.no_image')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {galleryImages.length > 1 ? (
                                            <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                                                {galleryImages.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveImage(img)
                                                        }
                                                        className={`size-14 overflow-hidden rounded-lg border-2 transition-all ${
                                                            activeImage === img
                                                                ? 'scale-105 border-primary shadow-sm'
                                                                : 'border-transparent opacity-70 hover:border-border hover:opacity-100'
                                                        }`}
                                                    >
                                                        <img
                                                            src={img}
                                                            className="size-full object-cover"
                                                            alt=""
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Right Column: Information & Inline Purchase/Wishlist Engine */}
                                    <div className="flex flex-col justify-between overflow-y-auto p-6 md:max-h-full md:p-8">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {listing.category && (
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                                        {listing.category.name}
                                                    </span>
                                                )}
                                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                                    {CONDITION_KEYS[
                                                        listing.condition
                                                    ]
                                                        ? t(
                                                              CONDITION_KEYS[
                                                                  listing
                                                                      .condition
                                                              ],
                                                          )
                                                        : listing.condition}
                                                </span>
                                            </div>

                                            <h2 className="text-xl leading-tight font-bold tracking-tight text-foreground md:text-2xl">
                                                {listing.title}
                                            </h2>

                                            <div className="text-2xl font-extrabold text-primary">
                                                <CurrencyFormatter
                                                    amount={listing.price}
                                                    sellerRegion={
                                                        listing.user?.region
                                                    }
                                                />
                                            </div>

                                            <div className="border-t border-border py-3">
                                                <h4 className="mb-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Product Description
                                                </h4>
                                                <p className="max-h-37.5 overflow-y-auto pr-1 text-sm leading-relaxed text-muted-foreground">
                                                    {listing.description ||
                                                        'No description provided for this premium item.'}
                                                </p>
                                            </div>

                                            {/* Seller Info Block */}
                                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                    {listing.user?.name
                                                        ? listing.user.name
                                                              .slice(0, 2)
                                                              .toUpperCase()
                                                        : 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {listing.user?.name ||
                                                            'Verified Seller'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {listing.user
                                                            ?.seller_type ===
                                                        'business'
                                                            ? 'Business Partner'
                                                            : 'Individual Seller'}
                                                        {listing.user?.region &&
                                                            ` · Region: ${listing.user.region}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3 border-t border-border pt-4">
                                            {/* Primary and secondary CTA actions */}
                                            <div className="flex gap-2">
                                                {/* View Full Product Page */}
                                                <Button
                                                    asChild
                                                    className="flex-1 rounded-xl shadow-sm hover:opacity-95"
                                                    size="lg"
                                                >
                                                    <Link
                                                        href={`/listings/${listing.id}`}
                                                    >
                                                        <span>
                                                            Full Product Details
                                                        </span>
                                                        <ExternalLink className="ml-1.5 size-4" />
                                                    </Link>
                                                </Button>

                                                {/* Favorite Toggle within Quick View */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-11 shrink-0 rounded-xl transition-transform hover:scale-105 active:scale-95"
                                                    onClick={
                                                        handleFavoriteToggle
                                                    }
                                                    aria-label="Add to favorites"
                                                >
                                                    <Heart
                                                        className={`size-5 transition-colors ${isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                                                    />
                                                </Button>
                                            </div>

                                            {/* Cart actions for business sellers */}
                                            {auth?.user &&
                                                auth.user.id !==
                                                    listing.user_id &&
                                                listing.user?.seller_type ===
                                                    'business' && (
                                                    <div className="w-full">
                                                        {auth.cartListingIds?.includes(
                                                            listing.id,
                                                        ) ? (
                                                            <Button
                                                                variant="secondary"
                                                                className="w-full rounded-xl"
                                                                size="lg"
                                                                asChild
                                                            >
                                                                <Link href="/cart">
                                                                    <ShoppingCart className="mr-2 size-4" />
                                                                    In Your Cart
                                                                    (Checkout
                                                                    Now)
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                className="w-full rounded-xl border-dashed hover:border-solid"
                                                                size="lg"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    router.post(
                                                                        `/listings/${listing.id}/cart`,
                                                                    );
                                                                }}
                                                            >
                                                                <ShoppingCart className="mr-2 size-4" />
                                                                {t(
                                                                    'listing.add_to_cart',
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </article>
    );
}

export function ListingCardSkeleton() {
    return (
        <div className="flex min-w-0 animate-pulse flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs">
            <div className="aspect-square w-full bg-muted/60" />
            <div className="flex flex-col gap-2 bg-muted/15 p-3.5">
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-5 w-1/3 rounded bg-muted" />
                <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
            </div>
        </div>
    );
}
