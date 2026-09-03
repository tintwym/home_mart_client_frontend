'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getListings } from '@/lib/api';
import { useSharedProps } from '@/lib/bootstrap';
import { ListingCard, type ListingCardListing } from '@/components/listing-card';
import { EmptyState } from '@/components/empty-state';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const shared = useSharedProps();
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const category = shared.categories?.find((c) => c.slug === slug);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getListings({ category: slug, category_slug: slug });
            const rows = (res.data ??
                res.listings ??
                (Array.isArray(res) ? res : [])) as ListingCardListing[];
            setListings(rows);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [slug]);

    return (
        <div>
            <BackLink href="/" label="Home" />
            <PageHeader
                title={category?.name || slug}
                description="Listings in this category"
            />
            {loading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : listings.length === 0 ? (
                <EmptyState
                    type="listings"
                    title="Nothing in this category yet"
                    description="Check back soon, or browse other categories from the home page."
                    actionLabel="Browse all listings"
                    actionHref="/"
                />
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
                    {listings.map((l) => (
                        <ListingCard key={l.id} listing={l} />
                    ))}
                </div>
            )}
        </div>
    );
}
