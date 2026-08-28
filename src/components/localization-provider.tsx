'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useBootstrap } from '@/lib/bootstrap';
import type { SharedCurrency, SharedData } from '@/types';
import { useTranslations } from '@/hooks/use-translations';
import { useCurrency } from '@/hooks/use-currency';
import {
    saveShopCurrency,
    saveShopLocale,
    saveShopRegion,
} from '@/lib/shop-prefs';

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
    const props = useSharedPropsFromBootstrap();
    const { refresh } = useBootstrap();
    const { t, locale } = useTranslations();
    const { currency, currencies, formatPrice } = useCurrency();
    const region = props.region || 'US';

    useEffect(() => {
        if (typeof document !== 'undefined' && locale) {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const setLocale = (code: string) => {
        saveShopLocale(code);
        void refresh({ locale: code });
    };

    const setRegion = (code: string, _localeHint?: string) => {
        saveShopRegion(code);
        void refresh({ region: code });
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

/** Read shared props without throwing when nested inside BootstrapProvider. */
function useSharedPropsFromBootstrap(): SharedData {
    const { shared } = useBootstrap();
    return shared;
}
