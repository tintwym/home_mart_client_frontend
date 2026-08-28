'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getCategories, getListing } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Category = {
    id: string;
    name: string;
    subcategories?: { id: string; name: string }[];
};

export default function EditListingPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('good');
    const [categoryId, setCategoryId] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === categoryId),
        [categories, categoryId],
    );
    const subcategories = selectedCategory?.subcategories ?? [];

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [authLoading, user, router]);

    useEffect(() => {
        void (async () => {
            try {
                const [listing, catsRes] = await Promise.all([
                    getListing(id),
                    getCategories(),
                ]);
                const rows = Array.isArray(catsRes)
                    ? catsRes
                    : ((catsRes as { data?: Category[]; categories?: Category[] })
                          .data ??
                      (catsRes as { categories?: Category[] }).categories ??
                      []);
                setCategories(rows as Category[]);

                setTitle(String(listing.title ?? ''));
                setDescription(String(listing.description ?? ''));
                setPrice(String(listing.price ?? ''));
                setCondition(String(listing.condition ?? 'good'));

                const listingSubId =
                    listing.subcategory_id ??
                    listing.category?.id ??
                    '';
                setSubcategoryId(listingSubId);

                const parent = (rows as Category[]).find((cat) =>
                    cat.subcategories?.some((s) => s.id === listingSubId),
                );
                if (parent) {
                    setCategoryId(parent.id);
                } else if (rows[0]) {
                    setCategoryId((rows[0] as Category).id);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    useEffect(() => {
        if (!selectedCategory) return;
        const subs = selectedCategory.subcategories ?? [];
        if (subs.length === 0) {
            setSubcategoryId('');
            return;
        }
        if (!subs.some((s) => s.id === subcategoryId)) {
            setSubcategoryId(subs[0]?.id ?? '');
        }
    }, [selectedCategory, subcategoryId]);

    if (loading) return <PageLoading />;
    if (error && !title) return <PageError message={error} />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href={`/listings/${id}`} label="Back" />
            <PageHeader title="Edit listing" />
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!subcategoryId) {
                        setError('Choose a subcategory.');
                        return;
                    }
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
                                subcategoryId,
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
                    <select
                        id="condition"
                        className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="new">New</option>
                        <option value="like_new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                    </select>
                </div>
                {categories.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {subcategories.length > 0 ? (
                            <div className="space-y-2">
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <select
                                    id="subcategory"
                                    className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                                    value={subcategoryId}
                                    onChange={(e) =>
                                        setSubcategoryId(e.target.value)
                                    }
                                    required
                                >
                                    {subcategories.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                    </>
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button
                    type="submit"
                    disabled={saving || !subcategoryId}
                    className="w-full"
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </Button>
            </form>
        </div>
    );
}
