'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, ApiError, getCategories, getListing } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import {
    BackLink,
    PageError,
    PageHeader,
    PageLoading,
} from '@/components/page-kit';
import { ShopErrorScreen } from '@/components/shop-error-screen';
import { ValidatedField } from '@/components/validated-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFieldValidation } from '@/hooks/use-field-validation';
import type { ShopErrorKind } from '@/lib/http-errors';
import {
    validateListingDescription,
    validateListingTitle,
    validatePrice,
    validateRequired,
} from '@/lib/form-validation';

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
    const [condition, setCondition] = useState('good');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [httpKind, setHttpKind] = useState<ShopErrorKind | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [ready, setReady] = useState(false);

    const { values, errors, setValue, blurField, validateAll, setValues } =
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
        if (!authLoading && !user)
            router.replace(loginHref(`/listings/${id}/edit`));
    }, [authLoading, user, router, id]);

    useEffect(() => {
        void (async () => {
            try {
                const [listing, catsRes] = await Promise.all([
                    getListing(id),
                    getCategories(),
                ]);
                const rows = Array.isArray(catsRes)
                    ? catsRes
                    : ((catsRes as {
                          data?: Category[];
                          categories?: Category[];
                      }).data ??
                      (catsRes as { categories?: Category[] }).categories ??
                      []);
                setCategories(rows as Category[]);
                setCondition(String(listing.condition ?? 'good'));

                const listingSubId =
                    listing.subcategory_id ?? listing.category?.id ?? '';
                const parent = (rows as Category[]).find((cat) =>
                    cat.subcategories?.some((s) => s.id === listingSubId),
                );
                if (parent) setCategoryId(parent.id);
                else if (rows[0]) setCategoryId((rows[0] as Category).id);

                setValues({
                    title: String(listing.title ?? ''),
                    description: String(listing.description ?? ''),
                    price: String(listing.price ?? ''),
                    subcategoryId: listingSubId,
                });
                setReady(true);
            } catch (e) {
                if (e instanceof ApiError) {
                    if (e.status === 404) {
                        setHttpKind('not-found');
                        return;
                    }
                    if (e.status === 401) {
                        setHttpKind('unauthorized');
                        return;
                    }
                    if (e.status === 403) {
                        setHttpKind('forbidden');
                        return;
                    }
                }
                setLoadError(e instanceof Error ? e.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, setValues]);

    useEffect(() => {
        if (!ready || !selectedCategory) return;
        const subs = selectedCategory.subcategories ?? [];
        if (subs.length === 0) {
            if (values.subcategoryId) setValue('subcategoryId', '');
            return;
        }
        if (!subs.some((s) => s.id === values.subcategoryId)) {
            setValue('subcategoryId', subs[0]?.id ?? '');
        }
    }, [ready, selectedCategory, setValue, values.subcategoryId]);

    if (loading) return <PageLoading />;
    if (httpKind) {
        return (
            <ShopErrorScreen
                kind={httpKind}
                returnTo={`/listings/${id}/edit`}
            />
        );
    }
    if (loadError && !ready) return <PageError message={loadError} />;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href={`/listings/${id}`} label="Back" />
            <PageHeader title="Edit listing" />
            <form
                className="space-y-4"
                noValidate
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateAll()) return;
                    setSaving(true);
                    setError(null);
                    try {
                        await apiFetch(`/api/listings/${id}`, {
                            method: 'PUT',
                            body: {
                                title: values.title.trim(),
                                description: values.description.trim(),
                                price: Number(values.price),
                                condition,
                                subcategoryId: values.subcategoryId,
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
                <ValidatedField
                    id="title"
                    label="Title"
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
                                        setValue(
                                            'subcategoryId',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() => blurField('subcategoryId')}
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
                        ) : null}
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
                    {saving ? 'Saving…' : 'Save changes'}
                </Button>
            </form>
        </div>
    );
}
