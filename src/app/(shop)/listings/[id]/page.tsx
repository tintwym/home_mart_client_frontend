'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getListing } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/currency-formatter';

type ListingDetail = {
    id: string;
    title: string;
    description?: string;
    price?: number;
    condition?: string;
    image_url?: string | null;
    image_path?: string | null;
    images?: { url?: string; path?: string }[];
    user?: { id: string; name: string };
    category?: { name?: string; slug?: string };
    is_favorited?: boolean;
    [key: string]: unknown;
};

export default function ListingShowPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = (await getListing(id)) as
                | ListingDetail
                | { listing: ListingDetail };
            const row =
                data && typeof data === 'object' && 'listing' in data
                    ? (data as { listing: ListingDetail }).listing
                    : (data as ListingDetail);
            setListing(row);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [id]);

    if (loading) return <PageLoading />;
    if (error || !listing)
        return <PageError message={error || 'Not found'} onRetry={() => void load()} />;

    const image =
        listing.image_url ||
        listing.images?.[0]?.url ||
        listing.image_path ||
        null;
    const isOwner = user?.id && listing.user?.id === user.id;

    return (
        <div>
            <BackLink href="/" label="Back to home" />
            <div className="grid gap-8 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-border bg-muted/40 aspect-square">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {listing.title}
                    </h1>
                    {listing.price != null ? (
                        <p className="mt-2 text-xl font-medium text-primary">
                            <CurrencyFormatter amount={listing.price} />
                        </p>
                    ) : null}
                    {listing.condition ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Condition: {listing.condition}
                        </p>
                    ) : null}
                    {listing.user ? (
                        <p className="mt-2 text-sm">
                            Seller:{' '}
                            <Link
                                href={`/users/${listing.user.id}`}
                                className="font-medium underline"
                            >
                                {listing.user.name}
                            </Link>
                        </p>
                    ) : null}
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {listing.description || 'No description.'}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {isOwner ? (
                            <Button asChild>
                                <Link href={`/listings/${listing.id}/edit`}>
                                    Edit listing
                                </Link>
                            </Button>
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
                                    Add to cart
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={busy || !user}
                                    onClick={async () => {
                                        if (!user) {
                                            router.push('/login');
                                            return;
                                        }
                                        setBusy(true);
                                        try {
                                            await apiFetch(
                                                `/api/listings/${listing.id}/favorite`,
                                                { method: 'POST', body: {} },
                                            );
                                        } catch (e) {
                                            alert(
                                                e instanceof Error
                                                    ? e.message
                                                    : 'Could not favorite',
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                >
                                    Favorite
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
                                                conversation?: { id: string };
                                                id?: string;
                                            }>(
                                                `/api/listings/${listing.id}/chat`,
                                                { method: 'POST', body: {} },
                                            );
                                            const cid =
                                                res.conversation?.id || res.id;
                                            if (cid) router.push(`/inbox/${cid}`);
                                            else router.push('/inbox');
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
                                    Message seller
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
