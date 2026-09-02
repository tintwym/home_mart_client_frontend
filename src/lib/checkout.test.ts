import { describe, expect, it } from 'vitest';
import { checkoutPathForFlow, mmqrImageUrl, unwrapCreatedListingId } from './checkout';

describe('checkoutPathForFlow', () => {
    it('routes Myanmar C2C to myanmar checkout', () => {
        expect(checkoutPathForFlow('c2c_mm', 'ord-1')).toBe(
            '/checkout/myanmar?orderId=ord-1',
        );
    });

    it('routes Vietnam C2C to vietnam checkout', () => {
        expect(checkoutPathForFlow('c2c_vn', 'ord-2')).toBe(
            '/checkout/vietnam?orderId=ord-2',
        );
    });

    it('defaults to stripe checkout', () => {
        expect(checkoutPathForFlow('stripe', 'ord-3')).toBe(
            '/checkout/stripe?orderId=ord-3',
        );
    });
});

describe('mmqrImageUrl', () => {
    it('encodes payload for QR service', () => {
        const url = mmqrImageUrl('hello world', 200);
        expect(url).toContain('200x200');
        expect(url).toContain(encodeURIComponent('hello world'));
    });
});

describe('unwrapCreatedListingId', () => {
    it('reads nested data.id', () => {
        expect(unwrapCreatedListingId({ data: { id: 'abc' } })).toBe('abc');
    });

    it('returns null for invalid payloads', () => {
        expect(unwrapCreatedListingId(null)).toBeNull();
        expect(unwrapCreatedListingId({})).toBeNull();
    });
});
