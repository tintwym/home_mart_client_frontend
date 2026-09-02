'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getUpgrades } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import {
    Sparkles,
    TrendingUp,
    Package,
    Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UpgradesData = {
    listing_count?: number;
    extra_listing_slots?: number;
    max_slots?: number;
    slot_price?: number;
    trend_price?: number;
    trend_duration_days?: number;
};

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
}: {
    label: string;
    value: string;
    hint?: string;
    icon: typeof Package;
}) {
    return (
        <div className="rounded-2xl border border-primary/15 bg-card/90 p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                        {value}
                    </p>
                    {hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    ) : null}
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </span>
            </div>
        </div>
    );
}

export default function UpgradesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<UpgradesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [purchaseNote, setPurchaseNote] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUpgrades();
            setData(res as UpgradesData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load upgrades');
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

    const slotsUsed = data?.listing_count ?? 0;
    const maxSlots = data?.max_slots ?? 0;
    const extraSlots = data?.extra_listing_slots ?? 0;
    const slotPrice = data?.slot_price ?? 5;
    const trendPrice = data?.trend_price ?? 10;
    const trendDays = data?.trend_duration_days ?? 7;
    const slotsRemaining = Math.max(0, maxSlots - slotsUsed);

    return (
        <div className="mx-auto max-w-2xl">
            <section className="shop-hero mb-8 px-6 py-8 sm:px-8">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 top-0 size-32 rounded-full bg-primary/15 blur-3xl"
                />
                <div className="relative">
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Sparkles className="size-3.5" />
                        Seller upgrades
                    </p>
                    <PageHeader
                        as="h1"
                        title="Grow your shop"
                        description="Extra listing slots and trending boosts help more buyers find your items."
                    />
                </div>
            </section>

            {loading || authLoading ? (
                <PageLoading label="Loading your seller stats…" />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <StatCard
                            label="Active listings"
                            value={String(slotsUsed)}
                            hint={`${slotsRemaining} slot${slotsRemaining === 1 ? '' : 's'} left`}
                            icon={Package}
                        />
                        <StatCard
                            label="Extra slots"
                            value={String(extraSlots)}
                            hint="Purchased add-ons"
                            icon={Package}
                        />
                        <StatCard
                            label="Max capacity"
                            value={String(maxSlots)}
                            icon={TrendingUp}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <h2 className="font-semibold">Listing slots</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                List more items at once when you need extra
                                capacity.
                            </p>
                            <p className="mt-4 text-3xl font-semibold text-primary">
                                ${slotPrice}
                                <span className="text-base font-normal text-muted-foreground">
                                    {' '}
                                    / slot
                                </span>
                            </p>
                            <Button
                                className="mt-4 w-full"
                                disabled={busy}
                                onClick={async () => {
                                    setBusy(true);
                                    setPurchaseNote(null);
                                    try {
                                        await apiFetch('/api/upgrades/slots', {
                                            method: 'POST',
                                            body: {},
                                        });
                                        await load();
                                        setPurchaseNote(
                                            'Slot purchased successfully.',
                                        );
                                    } catch (e) {
                                        setPurchaseNote(
                                            e instanceof Error
                                                ? e.message
                                                : 'Purchase unavailable',
                                        );
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                {busy ? 'Processing…' : 'Buy extra slot'}
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <h2 className="font-semibold">Trending boost</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Highlight a listing on the home feed for{' '}
                                {trendDays} days.
                            </p>
                            <p className="mt-4 text-3xl font-semibold text-primary">
                                ${trendPrice}
                                <span className="text-base font-normal text-muted-foreground">
                                    {' '}
                                    / {trendDays} days
                                </span>
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 w-full"
                                asChild
                            >
                                <Link href="/listings/create">
                                    Boost from a listing
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {purchaseNote ? (
                        <div
                            className={cn(
                                'flex items-start gap-2 rounded-xl border px-4 py-3 text-sm',
                                purchaseNote.includes('success')
                                    ? 'border-primary/30 bg-primary/5 text-primary'
                                    : 'border-border bg-muted/30 text-muted-foreground',
                            )}
                            role="status"
                        >
                            <Info className="mt-0.5 size-4 shrink-0" />
                            <span>{purchaseNote}</span>
                        </div>
                    ) : null}

                    <p className="text-center text-xs text-muted-foreground">
                        Need help?{' '}
                        <Link
                            href="/settings"
                            className="font-medium text-primary hover:underline"
                        >
                            Contact via account settings
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
