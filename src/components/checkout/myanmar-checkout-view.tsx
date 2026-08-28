'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    arrangeMeetup,
    fetchMyanmarCheckout,
    mmqrImageUrl,
    submitLocalPayment,
    type MyanmarCheckoutData,
} from '@/lib/checkout';
import { useBootstrap } from '@/lib/bootstrap';
import { BackLink, PageError, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    QrCode,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';

type MmMethod = {
    id: string;
    labelKey: string;
    hintKey: string;
    kind: 'qr' | 'input';
    placeholderKey?: string;
};

const MM_METHODS: MmMethod[] = [
    {
        id: 'mmqr',
        labelKey: 'checkout.mm_method_mmqr',
        hintKey: 'checkout.mm_hint_mmqr',
        kind: 'qr',
    },
    {
        id: 'kbz_pay',
        labelKey: 'checkout.mm_method_kbz_pay',
        hintKey: 'checkout.mm_hint_kbz_pay',
        kind: 'input',
        placeholderKey: 'checkout.mm_placeholder_phone',
    },
    {
        id: 'wave_pay',
        labelKey: 'checkout.mm_method_wave_pay',
        hintKey: 'checkout.mm_hint_wave_pay',
        kind: 'input',
        placeholderKey: 'checkout.mm_placeholder_phone',
    },
    {
        id: 'aya_pay',
        labelKey: 'checkout.mm_method_aya_pay',
        hintKey: 'checkout.mm_hint_aya_pay',
        kind: 'input',
        placeholderKey: 'checkout.mm_placeholder_phone',
    },
    {
        id: 'cb_pay',
        labelKey: 'checkout.mm_method_cb_pay',
        hintKey: 'checkout.mm_hint_cb_pay',
        kind: 'input',
        placeholderKey: 'checkout.mm_placeholder_phone',
    },
    {
        id: 'mpu',
        labelKey: 'checkout.mm_method_mpu',
        hintKey: 'checkout.mm_hint_mpu',
        kind: 'input',
        placeholderKey: 'checkout.mm_placeholder_mpu',
    },
    {
        id: 'bank',
        labelKey: 'checkout.mm_method_bank',
        hintKey: 'checkout.mm_hint_bank',
        kind: 'input',
        placeholderKey: 'checkout.placeholder_optional',
    },
];

function formatMmk(amount: number | string | undefined): string {
    const n = typeof amount === 'string' ? Number(amount) : amount;
    if (!n || Number.isNaN(n)) return 'Ks 0';
    return `Ks ${Math.round(n).toLocaleString('en-US')}`;
}

type MyanmarCheckoutViewProps = {
    orderId: string;
};

export function MyanmarCheckoutView({ orderId }: MyanmarCheckoutViewProps) {
    const { refresh } = useBootstrap();
    const { t } = useTranslations();
    const [data, setData] = useState<MyanmarCheckoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [method, setMethod] = useState('mmqr');
    const [identifier, setIdentifier] = useState('');
    const [showQr, setShowQr] = useState(true);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchMyanmarCheckout(orderId);
                if (cancelled) return;
                setData(res);
                setMethod(res.default_method ?? 'mmqr');
            } catch (e) {
                if (cancelled) return;
                setError(
                    e instanceof Error
                        ? e.message
                        : 'Failed to load checkout',
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    const activeMethod = useMemo(
        () => MM_METHODS.find((m) => m.id === method) ?? MM_METHODS[0],
        [method],
    );

    const qrUrl = data?.mmqr?.payload
        ? mmqrImageUrl(data.mmqr.payload, 280)
        : null;

    const amountMmk = data?.mmqr?.amount_mmk ?? data?.order?.total_mmk;
    const merchantName =
        data?.mmqr?.merchant_name ?? data?.merchant?.name ?? t('checkout.mm_store_name');

    const confirmPayment = async () => {
        if (!data) return;
        if (activeMethod.kind === 'input' && !identifier.trim()) {
            setError(t(activeMethod.hintKey));
            return;
        }
        setBusy(true);
        setError(null);
        try {
            await submitLocalPayment(
                'MM',
                orderId,
                method,
                identifier.trim() || data.order.id,
            );
            await refresh();
            setDone(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment failed');
        } finally {
            setBusy(false);
        }
    };

    const arrangeMeetupFlow = async () => {
        setBusy(true);
        setError(null);
        try {
            await arrangeMeetup('MM', orderId);
            await refresh();
            setDone(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <PageLoading />;
    if (error && !data) {
        return <PageError message={error} />;
    }
    if (!data) return null;

    if (done) {
        return (
            <div className="mx-auto max-w-lg text-center">
                <CheckCircle2 className="mx-auto mb-4 size-12 text-primary" />
                <h1 className="text-xl font-semibold">
                    {t('checkout.secure_checkout')}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Payment submitted. We will confirm shortly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button asChild>
                        <Link href="/settings/orders">View orders</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">Continue shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl">
            <BackLink href="/cart" label={t('checkout.back_to_cart')} />

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border bg-linear-to-r from-amber-500/10 via-primary/5 to-transparent px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {t('checkout.secure_checkout')}
                            </p>
                            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                                {t('checkout.mm_head_title')}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {merchantName}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            <ShieldCheck className="size-3.5 text-primary" />
                            MMQR
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                {t('checkout.order_summary')}
                            </h2>
                            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                                {(data.order.items ?? []).map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                                    >
                                        <span className="line-clamp-2 min-w-0">
                                            {item.listing?.title ?? 'Item'}
                                        </span>
                                        {item.listing?.price != null ? (
                                            <span className="shrink-0 text-muted-foreground">
                                                {formatMmk(item.listing.price)}
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                {t('checkout.total_due')}
                            </p>
                            <p className="mt-1 text-2xl font-bold tracking-tight">
                                {formatMmk(amountMmk)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Order {data.order.id.slice(0, 8)}…
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                {t('checkout.payment_method')}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('checkout.mm_wallets_heading')}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {MM_METHODS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                            setMethod(m.id);
                                            setIdentifier('');
                                            setError(null);
                                            if (m.kind === 'qr') setShowQr(true);
                                        }}
                                        className={cn(
                                            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                            method === m.id
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background hover:bg-accent',
                                        )}
                                    >
                                        {t(m.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeMethod.kind === 'qr' ? (
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="size-4 text-primary" />
                                        <h3 className="font-semibold">
                                            {t('checkout.mm_mmqr_title')}
                                        </h3>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setShowQr((v) => !v)}
                                    >
                                        {showQr
                                            ? t('checkout.hide')
                                            : t('checkout.show')}{' '}
                                        {t('checkout.qr_code')}
                                    </Button>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t('checkout.mm_scan_mmqr')}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t('checkout.mm_hint_mmqr')}
                                </p>

                                {showQr && qrUrl ? (
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="rounded-2xl border-4 border-white bg-white p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={qrUrl}
                                                alt={t('checkout.payment_qr_alt')}
                                                width={280}
                                                height={280}
                                                className="size-[min(280px,70vw)] rounded-lg"
                                            />
                                        </div>
                                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Smartphone className="size-3.5" />
                                            {t('checkout.scan_qr_in', {
                                                method: 'MMQR',
                                            })}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="mmqr-ref">
                                        Transaction reference (optional)
                                    </Label>
                                    <Input
                                        id="mmqr-ref"
                                        value={identifier}
                                        onChange={(e) =>
                                            setIdentifier(e.target.value)
                                        }
                                        placeholder={t(
                                            'checkout.placeholder_optional',
                                        )}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <h3 className="font-semibold">
                                    {t(activeMethod.labelKey)}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t(activeMethod.hintKey)}
                                </p>
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="wallet-id">
                                        {t(activeMethod.hintKey)}
                                    </Label>
                                    <Input
                                        id="wallet-id"
                                        value={identifier}
                                        onChange={(e) =>
                                            setIdentifier(e.target.value)
                                        }
                                        placeholder={
                                            activeMethod.placeholderKey
                                                ? t(activeMethod.placeholderKey)
                                                : undefined
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}

                        <Button
                            className="h-11 w-full text-base font-semibold"
                            disabled={busy}
                            onClick={() => void confirmPayment()}
                        >
                            {busy
                                ? t('checkout.vn_processing')
                                : t('checkout.pay_amount', {
                                      amount: formatMmk(amountMmk),
                                  })}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={busy}
                            onClick={() => void arrangeMeetupFlow()}
                        >
                            {t('checkout.c2c_confirm')}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            {t('checkout.c2c_confirm_hint')}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
