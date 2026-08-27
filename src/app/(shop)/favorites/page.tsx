'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFavorites } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ListingCard, type ListingCardListing } from '@/components/listing-card';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getFavorites();
            const rows = Array.isArray(res)
                ? res
                : ((res as { data?: unknown[]; favorites?: unknown[]; listings?: unknown[] })
                      .data ??
                  (res as { favorites?: unknown[] }).favorites ??
                  (res as { listings?: unknown[] }).listings ??
                  []);
            setListings(rows as ListingCardListing[]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }
        if (user) void load();
    }, [authLoading, user, router]);

    return (
        <div>
            <PageHeader title="Favorites" />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : listings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet.</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {listings.map((l) => (
                        <ListingCard key={l.id} listing={l} />
                    ))}
                </div>
            )}
        </div>
    );
}
