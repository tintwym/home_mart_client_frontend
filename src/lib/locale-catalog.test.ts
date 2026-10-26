import { describe, expect, it } from 'vitest';
import { getLocaleCatalog, mergeTranslations } from './locale-catalog';

describe('locale-catalog', () => {
    it('returns English cart drawer strings from the bundled catalog', () => {
        const en = getLocaleCatalog('en');
        expect(en['cart_drawer.your_order']).toBe('Your Order');
        expect(en['cart_drawer.empty_title']).toBe('Your cart is empty');
        expect(en['region.select']).toBe('Select region');
    });

    it('falls back to English for unknown locales', () => {
        expect(getLocaleCatalog('nope')['nav.cart']).toBe('Cart');
    });

    it('lets server translations override the static catalog', () => {
        const merged = mergeTranslations('en', {
            'cart_drawer.your_order': 'Server Order',
        });
        expect(merged['cart_drawer.your_order']).toBe('Server Order');
        expect(merged['cart_drawer.browse']).toBe('Browse Products');
    });

    it('uses the static catalog when server translations are empty', () => {
        const merged = mergeTranslations('en', {});
        expect(merged['currency.select']).toBe('Select Currency');
    });
});
