'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile } from '@/lib/api';
import { ListingCard, type ListingCardListing } from '@/components/listing-card';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [listings, setListings] = useState<ListingCardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = (await getUserProfile(id)) as Record<string, unknown>;
            const user =
                (res.user as { name?: string }) ||
                (res as { name?: string });
            setName(user.name || 'Seller');
            const rows = (res.listings ||
                res.data ||
                []) as ListingCardListing[];
            setListings(Array.isArray(rows) ? rows : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [id]);

    if (loading) return <PageLoading />;
    if (error) return <PageError message={error} onRetry={() => void load()} />;

    return (
        <div>
            <BackLink href="/" label="Home" />
            <PageHeader title={name} description="Seller profile" />
            {listings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No active listings.
                </p>
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
