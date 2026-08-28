'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getCategories } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Category = {
    id: string;
    name: string;
    slug?: string;
    subcategories?: { id: string; name: string; slug?: string }[];
};

export default function CreateListingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('good');
    const [categoryId, setCategoryId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [authLoading, user, router]);

    useEffect(() => {
        void (async () => {
            try {
                const res = await getCategories();
                const rows = Array.isArray(res)
                    ? res
                    : ((res as { data?: Category[]; categories?: Category[] })
                          .data ??
                      (res as { categories?: Category[] }).categories ??
                      []);
                setCategories(rows as Category[]);
                if (rows[0]) setCategoryId((rows[0] as Category).id);
            } catch {
                /* ignore */
            }
        })();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const category = categories.find((c) => c.id === categoryId);
            const subcategoryId =
                category?.subcategories?.[0]?.id ?? categoryId;
            if (!subcategoryId) {
                setError('Choose a category.');
                setSaving(false);
                return;
            }
            const created = await apiFetch<{ id?: string; listing?: { id: string } }>(
                '/api/listings',
                {
                    method: 'POST',
                    body: {
                        title,
                        description,
                        price: Number(price),
                        condition,
                        subcategoryId: subcategoryId,
                    },
                },
            );
            const id = created.id || created.listing?.id;
            router.push(id ? `/listings/${id}` : '/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/" label="Cancel" />
            <PageHeader title="Create listing" description="List an item for sale." />
            <form onSubmit={onSubmit} className="space-y-4">
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
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
                        min="0"
                        step="0.01"
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
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={saving} className="w-full">
                    {saving ? 'Saving…' : 'Publish listing'}
                </Button>
            </form>
        </div>
    );
}
