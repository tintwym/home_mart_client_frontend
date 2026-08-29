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
import { LayoutGrid, Plus, Sparkles } from 'lucide-react';

export function HomePageContent() {
    const shared = useSharedProps();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getListings(query ? { q: query } : undefined);
            const rows = (res.data ??
                res.listings ??
                (Array.isArray(res) ? res : [])) as ListingCardListing[];
            setListings(rows);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(searchQuery);
    }, [searchQuery]);

    const categories = shared.categories ?? [];
    const appName = shared.name || 'Home Mart';

    return (
        <div className="space-y-8">
            {!searchQuery ? (
                <section className="shop-hero px-5 py-8 sm:px-10 sm:py-11">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-primary/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-14 -left-10 size-52 rounded-full bg-secondary/35 blur-3xl"
                    />

                    <div className="relative max-w-2xl">
                        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                            <Sparkles className="size-3.5" aria-hidden />
                            {appName}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Find great deals near you
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Browse local listings, message sellers, and checkout
                            securely — all in one place.
                        </p>
                        <div className="mt-6 hidden flex-wrap gap-3 sm:flex">
                            <Button asChild className="shadow-sm">
                                <Link href="/listings/create">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Sell something
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/favorites">View saved items</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            ) : null}

            {!searchQuery && categories.length > 0 ? (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <LayoutGrid
                            className="size-4 text-primary"
                            aria-hidden
                        />
                        <h2 className="text-sm font-semibold tracking-wide text-foreground">
                            Browse categories
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
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

            <section>
                <PageHeader
                    as="h2"
                    title={
                        searchQuery
                            ? `Results for “${searchQuery}”`
                            : 'Latest listings'
                    }
                    description={
                        searchQuery
                            ? `${listings.length} ${listings.length === 1 ? 'match' : 'matches'} found`
                            : 'Fresh picks from sellers in your region'
                    }
                />

                {loading ? (
                    <ListingGridSkeleton />
                ) : error ? (
                    <PageError
                        message={error}
                        onRetry={() => void load(searchQuery)}
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
                                ? 'Try a different search term or browse categories.'
                                : 'Be the first to list an item in your area.'
                        }
                        actionLabel={
                            searchQuery ? 'Clear search' : 'Start selling'
                        }
                        actionHref={
                            searchQuery ? '/' : '/listings/create'
                        }
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
