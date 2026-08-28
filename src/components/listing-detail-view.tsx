'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye,
    Heart,
    MapPin,
    MessageCircle,
    Pencil,
    ShoppingCart,
    Star,
} from 'lucide-react';
import {
    apiFetch,
    getListing,
    resolveListingImage,
    type ListingDetail,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBootstrap, useSharedProps } from '@/lib/bootstrap';
import {
    ListingCard,
    type ListingCardListing,
} from '@/components/listing-card';
import { BackLink, PageError, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/currency-formatter';
import { useTranslations } from '@/hooks/use-translations';
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

export function ListingDetailView({ id }: ListingDetailViewProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { refresh } = useBootstrap();
    const { auth } = useSharedProps();
    const { t } = useTranslations();
    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [favorited, setFavorited] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const row = await getListing(id);
            setListing(row);
        } catch (e) {
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
    if (error || !listing) {
        return (
            <PageError
                message={error || 'Listing not found'}
                onRetry={() => void load()}
            />
        );
    }

    const seller = listing.seller ?? listing.user ?? null;
    const ownerId = listing.user_id ?? seller?.id;
    const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);
    const image = resolveListingImage(listing);
    const conditionLabel = listing.condition
        ? t(CONDITION_KEYS[listing.condition] ?? listing.condition)
        : null;
    const related = (listing.related_listings ?? []) as ListingCardListing[];

    return (
        <div>
            <BackLink href="/" label="Back to home" />

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40">
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
                        <span className="absolute top-3 left-3 rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
                            Sold
                        </span>
                    ) : null}
                    {listing.is_trending ? (
                        <span className="absolute top-3 right-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
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

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
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
                        <p className="mt-4 text-sm">
                            {t('listing.seller')}:{' '}
                            <Link
                                href={`/users/${seller.id}`}
                                className="font-medium text-foreground underline-offset-2 hover:underline"
                            >
                                {seller.name}
                            </Link>
                        </p>
                    ) : null}

                    {listing.meetup_location ? (
                        <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <span>
                                {t('listing.meetup_location_label')}:{' '}
                                {listing.meetup_location}
                            </span>
                        </p>
                    ) : null}

                    <div className="mt-5 rounded-lg border border-border/80 bg-muted/30 p-4">
                        <h2 className="text-sm font-semibold">
                            {t('listing.details')}
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                            {listing.description?.trim() ||
                                t('listing.no_description')}
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
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
                                    disabled={busy || !user}
                                    onClick={async () => {
                                        if (!user) {
                                            router.push('/login');
                                            return;
                                        }
                                        setBusy(true);
                                        try {
                                            await apiFetch(
                                                `/api/listings/${listing.id}/cart`,
                                                { method: 'POST', body: {} },
                                            );
                                            await refresh();
                                            router.push('/cart');
                                        } catch (e) {
                                            alert(
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Could not add to cart',
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                >
                                    <ShoppingCart className="mr-1.5 size-4" />
                                    {t('listing.add_to_cart')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={busy || !user}
                                    className={cn(
                                        favorited &&
                                            'border-primary text-primary',
                                    )}
                                    onClick={async () => {
                                        if (!user) {
                                            router.push('/login');
                                            return;
                                        }
                                        setBusy(true);
                                        try {
                                            const res = await apiFetch<{
                                                favorited?: boolean;
                                            }>(
                                                `/api/listings/${listing.id}/favorite`,
                                                { method: 'POST', body: {} },
                                            );
                                            setFavorited(Boolean(res.favorited));
                                            await refresh();
                                        } catch (e) {
                                            alert(
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Could not update favorite',
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
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
                                    disabled={busy || !user}
                                    onClick={async () => {
                                        if (!user) {
                                            router.push('/login');
                                            return;
                                        }
                                        setBusy(true);
                                        try {
                                            const res = await apiFetch<{
                                                conversation_id?: string;
                                            }>(
                                                `/api/listings/${listing.id}/chat`,
                                                { method: 'POST', body: {} },
                                            );
                                            if (res.conversation_id) {
                                                router.push(
                                                    `/inbox/${res.conversation_id}`,
                                                );
                                            } else {
                                                router.push('/inbox');
                                            }
                                        } catch (e) {
                                            alert(
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Could not start chat',
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                >
                                    <MessageCircle className="mr-1.5 size-4" />
                                    Message seller
                                </Button>
                            </>
                        )}
                    </div>

                    {!user && !isOwner && !listing.is_sold ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                            <Link href="/login" className="underline">
                                Sign in
                            </Link>{' '}
                            to add to cart, save, or message the seller.
                        </p>
                    ) : null}
                </div>
            </div>

            {(listing.reviews?.length ?? 0) > 0 ? (
                <section className="mt-12">
                    <h2 className="text-lg font-semibold">
                        {t('listing.reviews_for')} {listing.title}
                    </h2>
                    <ul className="mt-4 space-y-4">
                        {listing.reviews?.map((review) => (
                            <li
                                key={review.id}
                                className="rounded-lg border border-border bg-card p-4"
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
                    <h2 className="text-lg font-semibold">
                        {t('listing.related_products')}
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {related.map((item) => (
                            <ListingCard key={item.id} listing={item} />
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
