'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getCategories } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { unwrapCreatedListingId } from '@/lib/checkout';
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
    const [subcategoryId, setSubcategoryId] = useState('');
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
                const res = await getCategories();
                const rows = Array.isArray(res)
                    ? res
                    : ((res as { data?: Category[]; categories?: Category[] })
                          .data ??
                      (res as { categories?: Category[] }).categories ??
                      []);
                setCategories(rows as Category[]);
                const first = rows[0] as Category | undefined;
                if (first) {
                    setCategoryId(first.id);
                    setSubcategoryId(first.subcategories?.[0]?.id ?? '');
                }
            } catch {
                /* ignore */
            }
        })();
    }, []);

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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (!subcategoryId) {
                setError('Choose a subcategory.');
                setSaving(false);
                return;
            }
            const created = await apiFetch<unknown>('/api/listings', {
                method: 'POST',
                body: {
                    title,
                    description,
                    price: Number(price),
                    condition,
                    subcategoryId,
                },
            });
            const id = unwrapCreatedListingId(created);
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
                        ) : (
                            <p className="text-sm text-destructive">
                                This category has no subcategories. Choose
                                another category.
                            </p>
                        )}
                    </>
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button
                    type="submit"
                    disabled={saving || !subcategoryId}
                    className="w-full"
                >
                    {saving ? 'Saving…' : 'Publish listing'}
                </Button>
            </form>
        </div>
    );
}
