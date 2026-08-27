'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getListing } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditListingPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('good');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [authLoading, user, router]);

    useEffect(() => {
        void (async () => {
            try {
                const data = (await getListing(id)) as Record<string, unknown>;
                const listing =
                    (data.listing as Record<string, unknown>) || data;
                setTitle(String(listing.title ?? ''));
                setDescription(String(listing.description ?? ''));
                setPrice(String(listing.price ?? ''));
                setCondition(String(listing.condition ?? 'good'));
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <PageLoading />;
    if (error) return <PageError message={error} />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href={`/listings/${id}`} label="Back" />
            <PageHeader title="Edit listing" />
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    setError(null);
                    try {
                        await apiFetch(`/api/listings/${id}`, {
                            method: 'PUT',
                            body: {
                                title,
                                description,
                                price: Number(price),
                                condition,
                            },
                        });
                        router.push(`/listings/${id}`);
                    } catch (err) {
                        setError(
                            err instanceof Error ? err.message : 'Update failed',
                        );
                    } finally {
                        setSaving(false);
                    }
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        className="border-input bg-background flex min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Input
                        id="condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={saving} className="w-full">
                    {saving ? 'Saving…' : 'Save changes'}
                </Button>
            </form>
        </div>
    );
}
