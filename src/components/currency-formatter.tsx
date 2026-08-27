import { useCurrency } from '@/hooks/use-currency';

interface CurrencyFormatterProps {
    amount: number | string;
    /**
     * Region whose currency the stored amount is priced in (the seller's
     * region). The amount is converted into the viewer's display currency.
     * Omit for amounts already priced in USD (platform fees, Stripe totals).
     */
    sellerRegion?: string | null;
    className?: string;
}

export function CurrencyFormatter({
    amount,
    sellerRegion,
    className,
}: CurrencyFormatterProps) {
    const { formatPrice } = useCurrency();

    return (
        <span className={className}>{formatPrice(amount, sellerRegion)}</span>
    );
}

const LOCALE_TAGS: Record<string, string> = {
    vi: 'vi-VN',
    my: 'my-MM',
    zh: 'zh-CN',
    ja: 'ja-JP',
};

export function formatCurrencyWithLocale(
    amount: number | string,
    locale: string,
    currencySymbol: string,
    decimals: number = 2,
): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (Number.isNaN(num)) {
        return `${currencySymbol}0`;
    }
    const localeTag = LOCALE_TAGS[locale] ?? 'en-US';
    const formatted = num.toLocaleString(localeTag, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return `${currencySymbol}${formatted}`;
}
