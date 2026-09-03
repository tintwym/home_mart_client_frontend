import { describe, expect, it } from 'vitest';
import { shopErrorKindFromStatus } from './http-errors';

describe('shopErrorKindFromStatus', () => {
    it('maps HTTP statuses to error kinds', () => {
        expect(shopErrorKindFromStatus(401)).toBe('unauthorized');
        expect(shopErrorKindFromStatus(403)).toBe('forbidden');
        expect(shopErrorKindFromStatus(404)).toBe('not-found');
        expect(shopErrorKindFromStatus(429)).toBe('rate-limit');
        expect(shopErrorKindFromStatus(500)).toBe('error');
        expect(shopErrorKindFromStatus(503)).toBe('unavailable');
    });
});
