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
    ImageOff,
} from 'lucide-react';
import { useState } from 'react';
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
    const { toast } = useToast();
    const canEdit = auth?.user && listing.user_id === auth.user.id;
    const isTrending =
        listing.trending_until && new Date(listing.trending_until) > new Date();
    const [imageError, setImageError] = useState(false);
    const imageSrc = resolveListingImage(listing);
    const showImage = Boolean(imageSrc && !imageError);

    const isOutOfStock =
        listing.is_sold ||
        (listing.inventory !== undefined && listing.inventory === 0);

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const [now] = useState(() => Date.now());
    const isNewArrival =
        !isOutOfStock &&
        !!listing.created_at &&
        now - new Date(listing.created_at).getTime() < SEVEN_DAYS_MS;

    const isFavorite =
        auth?.user && auth.favoriteListingIds?.includes(listing.id);

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
                            ? 'Saved'
                            : 'Removed from saved',
                        description: favorited
                            ? `"${listing.title}" is in your wishlist.`
                            : `"${listing.title}" was removed.`,
                        variant: 'success',
                    });
                },
            },
        );
    };

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(
            `/listings/${listing.id}/cart`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    void refresh();
                    window.dispatchEvent(new CustomEvent('open-cart-drawer'));
                    toast({
                        title: 'Added to cart',
                        description: `"${listing.title}" is ready for checkout.`,
                        variant: 'success',
                    });
                },
            },
        );
    };

    return (
        <article className="group/card relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
            <div className="relative aspect-square w-full overflow-hidden bg-muted/50">
                <Link href={`/listings/${listing.id}`} className="block size-full">
                    {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageSrc!}
                            alt={listing.title}
                            className="size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <ImageOff className="size-5 stroke-[1.5]" />
                            <span>{t('listing.no_image')}</span>
                        </div>
                    )}
                </Link>

                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                    <div>
                        {isOutOfStock ? (
                            <span className="rounded-md bg-foreground/75 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-background uppercase backdrop-blur-sm">
                                Sold
                            </span>
                        ) : isTrending ? (
                            <span className="rounded-md bg-chart-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm">
                                {t('listing.trending')}
                            </span>
                        ) : isNewArrival ? (
                            <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase shadow-sm">
                                New
                            </span>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                        {canEdit ? (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative z-10"
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0 rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-md hover:bg-background"
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
                        ) : (
                            <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={handleFavoriteToggle}
                                className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                                aria-label={
                                    isFavorite
                                        ? 'Remove from favorites'
                                        : 'Save to favorites'
                                }
                            >
                                <Heart
                                    className={cn(
                                        'size-3.5',
                                        isFavorite
                                            ? 'fill-destructive text-destructive'
                                            : 'text-muted-foreground',
                                    )}
                                />
                            </button>
                        )}
                    </div>
                </div>

                {isOutOfStock ? (
                    <div className="pointer-events-none absolute inset-0 bg-background/20" />
                ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate font-medium">
                        {listing.category?.name ?? 'General'}
                    </span>
                    <span className="shrink-0 tabular-nums">
                        {formatRelativeTime(listing.created_at, t)}
                    </span>
                </div>

                <Link
                    href={`/listings/${listing.id}`}
                    className="block min-w-0 transition-colors group-hover/card:text-primary"
                >
                    <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                        {listing.title}
                    </h3>
                </Link>

                <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <div className="min-w-0">
                        <p className="text-base font-bold tracking-tight text-foreground">
                            <CurrencyFormatter
                                amount={listing.price}
                                sellerRegion={listing.user?.region}
                            />
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            {listing.user?.name ?? t('common.unknown')}
                            {CONDITION_KEYS[listing.condition]
                                ? ` · ${t(CONDITION_KEYS[listing.condition])}`
                                : ''}
                            {listing.rating != null &&
                            (listing.reviews_count ?? 0) > 0
                                ? ` · ★ ${listing.rating.toFixed(1)}`
                                : ''}
                        </p>
                    </div>

                    {auth?.user &&
                        auth.user.id !== listing.user_id &&
                        listing.user?.seller_type === 'business' &&
                        !isOutOfStock && (
                            <div className="shrink-0">
                                {auth.cartListingIds?.includes(listing.id) ? (
                                    <Link
                                        href="/cart"
                                        className="inline-flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                                        title={t('listing.in_cart')}
                                        aria-label={t('listing.in_cart')}
                                    >
                                        <ShoppingCart className="size-3.5 fill-current" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                                        onClick={addToCart}
                                        title={t('listing.add_to_cart')}
                                        aria-label={t('listing.add_to_cart')}
                                    >
                                        <ShoppingCart className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                </div>
            </div>
        </article>
    );
}

export function ListingCardSkeleton() {
    return (
        <div className="flex min-w-0 animate-pulse flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs">
            <div className="aspect-square w-full bg-muted/60" />
            <div className="flex flex-col gap-2 p-3.5">
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-5 w-1/3 rounded bg-muted" />
            </div>
        </div>
    );
}
