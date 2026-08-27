import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { router, usePage } from '@/lib/inertia-compat';
import type { SharedCurrency, SharedData } from '@/types';
import { useTranslations } from '@/hooks/use-translations';
import { useCurrency } from '@/hooks/use-currency';

interface LocalizationContextType {
    locale: string;
    region: string;
    currency: SharedCurrency;
    currencies: Record<string, SharedCurrency>;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatPrice: (
        amount: number | string,
        sellerRegion?: string | null,
    ) => string;
    setLocale: (code: string) => void;
    /** Changing region also applies that region's language + currency on the server. */
    setRegion: (code: string, localeHint?: string) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
    undefined,
);

export function useLocalization() {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error(
            'useLocalization must be used within a LocalizationProvider',
        );
    }
    return context;
}

export function LocalizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { props } = usePage<SharedData>();
    const { t, locale } = useTranslations();
    const { currency, currencies, formatPrice } = useCurrency();
    const region = props.region || 'US';

    useEffect(() => {
        if (typeof document !== 'undefined' && locale) {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const setLocale = (code: string) => {
        router.post('/locale', { locale: code }, { preserveScroll: true });
    };

    const setRegion = (code: string, _localeHint?: string) => {
        // Backend sets locale + currency cookies from REGION_LOCALES / CURRENCIES.
        router.post('/region', { region: code }, { preserveScroll: true });
    };

    const value = useMemo(
        () => ({
            locale,
            region,
            currency,
            currencies,
            t,
            formatPrice,
            setLocale,
            setRegion,
        }),
        [locale, region, currency, currencies, t, formatPrice],
    );

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
}
