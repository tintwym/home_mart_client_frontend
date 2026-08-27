'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import { useSharedProps } from '@/lib/bootstrap';
import { ListingCard, type ListingCardListing } from '@/components/listing-card';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HomePage() {
    const shared = useSharedProps();
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getListings();
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
        void load();
    }, []);

    const categories = shared.categories ?? [];

    return (
        <div>
            <section className="mb-8 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/15 px-6 py-10 sm:px-10">
                <p className="text-sm font-medium text-primary">
                    {shared.name || 'Home Mart'}
                </p>
                <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                    Find great deals near you
                </h1>
                <p className="mt-2 max-w-lg text-muted-foreground">
                    Browse local listings, message sellers, and checkout securely.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/listings/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Sell something
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/favorites">Favorites</Link>
                    </Button>
                </div>
            </section>

            {categories.length > 0 ? (
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.slice(0, 12).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/40"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            ) : null}

            <PageHeader title="Latest listings" />

            {loading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : listings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No listings yet.</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}
