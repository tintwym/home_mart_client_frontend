'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
    Eye,
    Heart,
    MapPin,
    MessageCircle,
    Pencil,
    ShoppingCart,
    Star,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
    apiFetch,
    ApiError,
    getListing,
    resolveListingImage,
    type ListingDetail,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { useBootstrap, useSharedProps } from '@/lib/bootstrap';
import {
    ListingCard,
    type ListingCardListing,
} from '@/components/listing-card';
import { BackLink, PageError, PageLoading } from '@/components/page-kit';
import { ShopErrorScreen } from '@/components/shop-error-screen';
import { ShopTrustStrip } from '@/components/shop-trust-strip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CurrencyFormatter } from '@/components/currency-formatter';
import { useTranslations } from '@/hooks/use-translations';
import type { ShopErrorKind } from '@/lib/http-errors';
import { cn } from '@/lib/utils';

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

type ListingDetailViewProps = {
    id: string;
};

type SellerChip = {
    id: string;
    name: string;
    region?: string | null;
    avatar?: string | null;
};

export function ListingDetailView({ id }: ListingDetailViewProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { refresh } = useBootstrap();
    const { auth } = useSharedProps();
    const { t } = useTranslations();
    const { toast } = useToast();
    const reduceMotion = useReducedMotion();
    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [missing, setMissing] = useState(false);
    const [httpKind, setHttpKind] = useState<ShopErrorKind | null>(null);
    const [busy, setBusy] = useState(false);
    const [favorited, setFavorited] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMissing(false);
        setHttpKind(null);
        try {
            const row = await getListing(id);
            setListing(row);
        } catch (e) {
            if (e instanceof ApiError) {
                if (e.status === 404) {
                    setMissing(true);
                    return;
                }
                if (e.status === 401 || e.status === 403 || e.status === 429) {
                    setHttpKind(
                        e.status === 401
                            ? 'unauthorized'
                            : e.status === 403
                              ? 'forbidden'
                              : 'rate-limit',
                    );
                    return;
                }
            }
            setError(e instanceof Error ? e.message : 'Failed to load listing');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!listing) return;
        setFavorited(auth.favoriteListingIds?.includes(listing.id) ?? false);
    }, [listing, auth.favoriteListingIds]);

    if (loading) return <PageLoading />;
    if (missing) notFound();
    if (httpKind) {
        return (
            <ShopErrorScreen
                kind={httpKind}
                onRetry={
                    httpKind === 'rate-limit' ? () => void load() : undefined
                }
                returnTo={`/listings/${id}`}
            />
        );
    }
    if (error || !listing) {
        return (
            <PageError
                message={error || 'Listing not found'}
                onRetry={() => void load()}
            />
        );
    }

    const seller = (listing.seller ?? listing.user ?? null) as SellerChip | null;
    const ownerId = listing.user_id ?? seller?.id;
    const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);
    const image = resolveListingImage(listing);
    const conditionLabel = listing.condition
        ? t(CONDITION_KEYS[listing.condition] ?? listing.condition)
        : null;
    const related = (listing.related_listings ?? []) as ListingCardListing[];
    const loginToListing = loginHref(`/listings/${listing.id}`);
    const showBuyerActions = !isOwner && !listing.is_sold;

    const requireUser = () => {
        if (user) return true;
        router.push(loginToListing);
        return false;
    };

    const addToCart = async () => {
        if (!requireUser()) return;
        setBusy(true);
        try {
            await apiFetch(`/api/listings/${listing.id}/cart`, {
                method: 'POST',
                body: {},
            });
            await refresh();
            window.dispatchEvent(new CustomEvent('open-cart-drawer'));
            toast({
                title: 'Added to cart',
                description: `"${listing.title}" is ready for checkout.`,
                variant: 'success',
            });
        } catch (e) {
            toast({
                title: 'Could not add to cart',
                description:
                    e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setBusy(false);
        }
    };

    const toggleFavorite = async () => {
        if (!requireUser()) return;
        setBusy(true);
        try {
            const res = await apiFetch<{ favorited?: boolean }>(
                `/api/listings/${listing.id}/favorite`,
                { method: 'POST', body: {} },
            );
            const next = Boolean(res.favorited);
            setFavorited(next);
            await refresh();
            toast({
                title: next ? 'Saved' : 'Removed from saved',
                description: next
                    ? `"${listing.title}" is in your wishlist.`
                    : `"${listing.title}" was removed.`,
                variant: 'success',
            });
        } catch (e) {
            toast({
                title: 'Could not update favorite',
                description:
                    e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setBusy(false);
        }
    };

    const messageSeller = async () => {
        if (!requireUser()) return;
        setBusy(true);
        try {
            const res = await apiFetch<{ conversation_id?: string }>(
                `/api/listings/${listing.id}/chat`,
                { method: 'POST', body: {} },
            );
            if (res.conversation_id) {
                router.push(`/inbox/${res.conversation_id}`);
            } else {
                router.push('/inbox');
            }
        } catch (e) {
            toast({
                title: 'Could not start chat',
                description:
                    e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setBusy(false);
        }
    };

    const sellerInitial = (seller?.name?.trim() || '?').charAt(0).toUpperCase();

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(showBuyerActions && 'pb-24 lg:pb-0')}
        >
            <BackLink href="/" label="Back to home" />

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/70 bg-muted/40 shadow-xs">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            {t('listing.no_image')}
                        </div>
                    )}
                    {listing.is_sold ? (
                        <span className="absolute top-3 left-3 rounded-lg bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
                            Sold
                        </span>
                    ) : null}
                    {listing.is_trending ? (
                        <span className="absolute top-3 right-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                            {t('listing.trending')}
                        </span>
                    ) : null}
                </div>

                <div className="flex flex-col">
                    {listing.category?.name ? (
                        <Link
                            href={`/categories/${listing.category.slug}`}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            {listing.category.name}
                        </Link>
                    ) : null}

                    <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {listing.title}
                    </h1>

                    {listing.price != null ? (
                        <p className="mt-3 text-2xl font-semibold text-primary">
                            <CurrencyFormatter
                                amount={listing.price}
                                sellerRegion={
                                    listing.user?.region ??
                                    listing.seller?.region
                                }
                            />
                        </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {conditionLabel ? (
                            <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
                                {conditionLabel}
                            </span>
                        ) : null}
                        {listing.views_count != null ? (
                            <span className="inline-flex items-center gap-1">
                                <Eye className="size-3.5" />
                                {listing.views_count} views
                            </span>
                        ) : null}
                        {(listing.review_count ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {listing.average_rating?.toFixed(1)} (
                                {listing.review_count}{' '}
                                {listing.review_count === 1
                                    ? t('listing.review')
                                    : t('listing.reviews')}
                                )
                            </span>
                        ) : null}
                    </div>

                    {seller ? (
                        <Link
                            href={`/users/${seller.id}`}
                            className="mt-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs transition-colors hover:border-primary/30 hover:bg-muted/30"
                        >
                            {seller.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={seller.avatar}
                                    alt=""
                                    className="size-11 rounded-xl object-cover"
                                />
                            ) : (
                                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
                                    {sellerInitial}
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {seller.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {seller.region
                                        ? `${t('listing.seller')} · ${seller.region}`
                                        : t('listing.seller')}
                                </p>
                            </div>
                        </Link>
                    ) : null}

                    {listing.meetup_location ? (
                        <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <span>
                                {t('listing.meetup_location_label')}:{' '}
                                {listing.meetup_location}
                            </span>
                        </p>
                    ) : null}

                    <div className="mt-5">
                        <h2 className="text-sm font-semibold tracking-wide text-foreground">
                            {t('listing.details')}
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                            {listing.description?.trim() ||
                                t('listing.no_description')}
                        </p>
                    </div>

                    <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
                        {isOwner ? (
                            <Button asChild>
                                <Link href={`/listings/${listing.id}/edit`}>
                                    <Pencil className="mr-1.5 size-4" />
                                    {t('listing.edit_listing')}
                                </Link>
                            </Button>
                        ) : listing.is_sold ? (
                            <Button disabled>Sold</Button>
                        ) : (
                            <>
                                <Button
                                    disabled={busy}
                                    onClick={() => void addToCart()}
                                >
                                    <ShoppingCart className="mr-1.5 size-4" />
                                    {user
                                        ? t('listing.add_to_cart')
                                        : 'Sign in to buy'}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={busy}
                                    className={cn(
                                        favorited &&
                                            'border-primary text-primary',
                                    )}
                                    onClick={() => void toggleFavorite()}
                                >
                                    <Heart
                                        className={cn(
                                            'mr-1.5 size-4',
                                            favorited && 'fill-current',
                                        )}
                                    />
                                    {favorited ? 'Saved' : 'Favorite'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    onClick={() => void messageSeller()}
                                >
                                    <MessageCircle className="mr-1.5 size-4" />
                                    Message seller
                                </Button>
                            </>
                        )}
                    </div>

                    {showBuyerActions ? (
                        <ShopTrustStrip className="mt-4 hidden lg:inline-flex" />
                    ) : null}

                    {!user && showBuyerActions ? (
                        <p className="mt-3 hidden text-sm text-muted-foreground lg:block">
                            <Link
                                href={loginToListing}
                                className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                                Sign in
                            </Link>{' '}
                            to buy, save, or message the seller.
                        </p>
                    ) : null}
                </div>
            </div>

            {(listing.reviews?.length ?? 0) > 0 ? (
                <section className="mt-12">
                    <h2 className="font-display text-lg font-semibold">
                        {t('listing.reviews_for')} {listing.title}
                    </h2>
                    <ul className="mt-4 space-y-4">
                        {listing.reviews?.map((review) => (
                            <li
                                key={review.id}
                                className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium">
                                        {review.user?.name ||
                                            t('listing.anonymous')}
                                    </p>
                                    {review.rating != null ? (
                                        <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                                            <Star className="size-3.5 fill-current" />
                                            {review.rating}/5
                                        </span>
                                    ) : null}
                                </div>
                                {review.comment ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {review.comment}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {related.length > 0 ? (
                <section className="mt-12">
                    <h2 className="font-display text-lg font-semibold">
                        {t('listing.related_products')}
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {related.map((item) => (
                            <ListingCard key={item.id} listing={item} />
                        ))}
                    </div>
                </section>
            ) : null}

            {isOwner ? (
                <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-border/60 bg-card/95 p-3 backdrop-blur-md lg:hidden">
                    <Button asChild className="w-full">
                        <Link href={`/listings/${listing.id}/edit`}>
                            <Pencil className="mr-1.5 size-4" />
                            {t('listing.edit_listing')}
                        </Link>
                    </Button>
                </div>
            ) : null}

            {showBuyerActions ? (
                <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-border/60 bg-card/95 px-3 py-2.5 backdrop-blur-md lg:hidden">
                    <div className="mx-auto flex max-w-6xl gap-2">
                        <Button
                            className="flex-1"
                            disabled={busy}
                            onClick={() => void addToCart()}
                        >
                            <ShoppingCart className="mr-1.5 size-4" />
                            {user ? t('listing.add_to_cart') : 'Sign in to buy'}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={busy}
                            className={cn(
                                'shrink-0',
                                favorited && 'border-primary text-primary',
                            )}
                            aria-label={favorited ? 'Saved' : 'Favorite'}
                            onClick={() => void toggleFavorite()}
                        >
                            <Heart
                                className={cn(
                                    'size-4',
                                    favorited && 'fill-current',
                                )}
                            />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            disabled={busy}
                            className="shrink-0"
                            aria-label="Message seller"
                            onClick={() => void messageSeller()}
                        >
                            <MessageCircle className="size-4" />
                        </Button>
                    </div>
                    <ShopTrustStrip className="mx-auto mt-2 max-w-6xl" />
                </div>
            ) : listing.is_sold ? (
                <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-border/60 bg-card/95 p-3 backdrop-blur-md lg:hidden">
                    <Button disabled className="w-full">
                        Sold
                    </Button>
                </div>
            ) : null}
        </motion.div>
    );
}
