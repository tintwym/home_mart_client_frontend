'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getCategories } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { unwrapCreatedListingId } from '@/lib/checkout';
import { BackLink, PageHeader } from '@/components/page-kit';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFieldValidation } from '@/hooks/use-field-validation';
import {
    validateListingDescription,
    validateListingTitle,
    validatePrice,
    validateRequired,
} from '@/lib/form-validation';

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
    const [condition, setCondition] = useState('good');
    const [categoryId, setCategoryId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const { values, errors, setValue, blurField, validateAll } =
        useFieldValidation(
            { title: '', description: '', price: '', subcategoryId: '' },
            {
                title: (value) => validateListingTitle(value),
                description: (value) => validateListingDescription(value),
                price: (value) => validatePrice(value),
                subcategoryId: (value) =>
                    validateRequired(value, 'Subcategory'),
            },
        );

    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === categoryId),
        [categories, categoryId],
    );
    const subcategories = selectedCategory?.subcategories ?? [];

    useEffect(() => {
        if (!authLoading && !user) router.replace(loginHref('/listings/create'));
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
                    setValue(
                        'subcategoryId',
                        first.subcategories?.[0]?.id ?? '',
                    );
                }
            } catch {
                /* ignore */
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;
        const subs = selectedCategory.subcategories ?? [];
        if (subs.length === 0) {
            if (values.subcategoryId) setValue('subcategoryId', '');
            return;
        }
        if (!subs.some((s) => s.id === values.subcategoryId)) {
            setValue('subcategoryId', subs[0]?.id ?? '');
        }
    }, [selectedCategory, setValue, values.subcategoryId]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAll()) return;
        setSaving(true);
        setError(null);
        try {
            const created = await apiFetch<unknown>('/api/listings', {
                method: 'POST',
                body: {
                    title: values.title.trim(),
                    description: values.description.trim(),
                    price: Number(values.price),
                    condition,
                    subcategoryId: values.subcategoryId,
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
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <ValidatedField
                    id="title"
                    label="Title"
                    placeholder="What are you selling?"
                    value={values.title}
                    onChange={(value) => setValue('title', value)}
                    onBlur={() => blurField('title')}
                    error={errors.title}
                    disabled={saving}
                />
                <ValidatedField
                    id="description"
                    label="Description"
                    multiline
                    placeholder="Condition, size, pickup notes…"
                    value={values.description}
                    onChange={(value) => setValue('description', value)}
                    onBlur={() => blurField('description')}
                    error={errors.description}
                    disabled={saving}
                />
                <ValidatedField
                    id="price"
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.price}
                    onChange={(value) => setValue('price', value)}
                    onBlur={() => blurField('price')}
                    error={errors.price}
                    disabled={saving}
                />
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
                                    value={values.subcategoryId}
                                    onChange={(e) =>
                                        setValue('subcategoryId', e.target.value)
                                    }
                                    onBlur={() => blurField('subcategoryId')}
                                    aria-invalid={
                                        errors.subcategoryId ? true : undefined
                                    }
                                >
                                    {subcategories.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subcategoryId ? (
                                    <p className="text-sm text-destructive">
                                        {errors.subcategoryId}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-destructive">
                                This category has no subcategories. Choose
                                another category.
                            </p>
                        )}
                    </>
                ) : null}
                {error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
                <Button
                    type="submit"
                    disabled={saving || !values.subcategoryId}
                    className="w-full"
                >
                    {saving ? 'Saving…' : 'Publish listing'}
                </Button>
            </form>
        </div>
    );
}
