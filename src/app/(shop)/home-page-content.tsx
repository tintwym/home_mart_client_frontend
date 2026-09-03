'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getListings } from '@/lib/api';
import { useSharedProps } from '@/lib/bootstrap';
import { ListingCard, type ListingCardListing } from '@/components/listing-card';
import {
    ListingGridSkeleton,
    PageError,
    PageHeader,
} from '@/components/page-kit';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    LayoutGrid,
    MessageCircle,
    Plus,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80';

const JUST_LISTED_COUNT = 4;

function ListingGrid({
    items,
    reduceMotion,
}: {
    items: ListingCardListing[];
    reduceMotion: boolean | null;
}) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
            {items.map((listing, index) => (
                <motion.div
                    key={listing.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.35,
                        delay: Math.min(index * 0.035, 0.28),
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    <ListingCard listing={listing} />
                </motion.div>
            ))}
        </div>
    );
}

export function HomePageContent() {
    const shared = useSharedProps();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getListings(
                    searchQuery ? { q: searchQuery } : undefined,
                );
                if (cancelled) return;
                const rows = (res.data ??
                    res.listings ??
                    (Array.isArray(res) ? res : [])) as ListingCardListing[];
                setListings(rows);
            } catch (e) {
                if (cancelled) return;
                setError(
                    e instanceof Error ? e.message : 'Failed to load listings',
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [searchQuery, reloadKey]);

    const categories = shared.categories ?? [];
    const appName = shared.name || 'Home Mart';
    const justListed = !searchQuery
        ? listings.slice(0, JUST_LISTED_COUNT)
        : [];
    const moreListings = !searchQuery
        ? listings.slice(JUST_LISTED_COUNT)
        : listings;

    return (
        <div className={searchQuery ? 'space-y-8' : 'space-y-10 sm:space-y-12'}>
            {!searchQuery ? (
                <section className="shop-hero-bleed relative isolate overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={HERO_IMAGE}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.04_175_/_0.88)] via-[oklch(0.24_0.035_175_/_0.72)] to-[oklch(0.28_0.03_175_/_0.35)]"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.03_175_/_0.55)] via-transparent to-transparent"
                    />

                    <div className="relative flex min-h-[min(68vw,22rem)] flex-col justify-end px-5 py-8 sm:min-h-[24rem] sm:px-10 sm:py-12 lg:min-h-[26rem]">
                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-xl"
                        >
                            <p className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {appName}
                            </p>
                            <h1 className="mt-3 max-w-md text-xl font-medium leading-snug text-white/95 sm:text-2xl">
                                Local finds for every room
                            </h1>
                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
                                Browse nearby listings, message sellers, and check
                                out securely.
                            </p>
                            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-white text-[oklch(0.28_0.04_175)] shadow-md hover:bg-white/95 sm:w-auto"
                                >
                                    <Link href="#listings">
                                        Browse listings
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="lg"
                                    className="w-full text-white hover:bg-white/10 hover:text-white sm:w-auto"
                                >
                                    <Link href="/listings/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Sell something
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            ) : null}

            {!searchQuery && categories.length > 0 ? (
                <section className="px-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <LayoutGrid
                                className="size-4 text-primary"
                                aria-hidden
                            />
                            <h2 className="text-sm font-semibold tracking-wide text-foreground">
                                Browse categories
                            </h2>
                        </div>
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Swipe to explore
                        </p>
                    </div>
                    <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
                        {categories.slice(0, 12).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="shop-pill"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            {!searchQuery ? (
                <section
                    aria-label="Why shop here"
                    className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6"
                >
                    {[
                        {
                            icon: Sparkles,
                            title: 'Local finds',
                            body: 'Browse what’s near you',
                        },
                        {
                            icon: MessageCircle,
                            title: 'Chat sellers',
                            body: 'Ask before you buy',
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Secure checkout',
                            body: 'Pay with confidence',
                        },
                    ].map(({ icon: Icon, title, body }) => (
                        <div
                            key={title}
                            className="flex min-w-0 flex-1 items-start gap-2.5"
                        >
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {body}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            ) : null}

            <section id="listings" className="scroll-mt-36 sm:scroll-mt-28">
                {searchQuery ? (
                    <PageHeader
                        as="h2"
                        title={`Results for “${searchQuery}”`}
                        description={`${listings.length} ${listings.length === 1 ? 'match' : 'matches'} found`}
                        action={
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/">Clear search</Link>
                            </Button>
                        }
                    />
                ) : null}

                {loading ? (
                    <ListingGridSkeleton />
                ) : error ? (
                    <PageError
                        message={error}
                        onRetry={() => setReloadKey((k) => k + 1)}
                    />
                ) : listings.length === 0 ? (
                    <EmptyState
                        type="listings"
                        title={
                            searchQuery
                                ? 'No matches found'
                                : 'No listings yet'
                        }
                        description={
                            searchQuery
                                ? 'Try a shorter phrase, or browse a category instead.'
                                : 'Be the first to list an item in your area.'
                        }
                        actionLabel={
                            searchQuery ? 'Clear search' : 'Start selling'
                        }
                        actionHref={searchQuery ? '/' : '/listings/create'}
                    />
                ) : searchQuery ? (
                    <ListingGrid items={listings} reduceMotion={reduceMotion} />
                ) : (
                    <div className="space-y-10">
                        {justListed.length > 0 ? (
                            <div>
                                <PageHeader
                                    as="h2"
                                    title="Just listed"
                                    description="Fresh picks from sellers near you"
                                />
                                <ListingGrid
                                    items={justListed}
                                    reduceMotion={reduceMotion}
                                />
                            </div>
                        ) : null}
                        {moreListings.length > 0 ? (
                            <div>
                                <PageHeader
                                    as="h2"
                                    title="More to explore"
                                    description="Keep browsing the marketplace"
                                />
                                <ListingGrid
                                    items={moreListings}
                                    reduceMotion={reduceMotion}
                                />
                            </div>
                        ) : null}
                    </div>
                )}
            </section>
        </div>
    );
}
