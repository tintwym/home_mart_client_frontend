const REGION_KEY = 'hm_shop_region';
const CURRENCY_KEY = 'hm_shop_currency';
const LOCALE_KEY = 'hm_shop_locale';

export function readShopPrefs(): {
    region?: string;
    currency?: string;
    locale?: string;
} {
    if (typeof localStorage === 'undefined') return {};
    return {
        region: localStorage.getItem(REGION_KEY) ?? undefined,
        currency: localStorage.getItem(CURRENCY_KEY) ?? undefined,
        locale: localStorage.getItem(LOCALE_KEY) ?? undefined,
    };
}

export function saveShopRegion(region: string): void {
    localStorage.setItem(REGION_KEY, region);
}

export function saveShopCurrency(currency: string): void {
    localStorage.setItem(CURRENCY_KEY, currency);
}

export function saveShopLocale(locale: string): void {
    localStorage.setItem(LOCALE_KEY, locale);
}
