import { describe, expect, it } from 'vitest';
import { unwrapPasskeyOptions } from './passkeys-client';

describe('unwrapPasskeyOptions', () => {
    it('reads nested { options, state } envelopes from the API', () => {
        const result = unwrapPasskeyOptions({
            state: 'abc-123',
            options: {
                challenge: 'challenge-bytes',
                rpId: 'localhost',
                allowCredentials: [],
            },
        });
        expect(result.state).toBe('abc-123');
        expect(result.options.challenge).toBe('challenge-bytes');
    });

    it('rejects payloads without a challenge (avoids .replace crash)', () => {
        expect(() =>
            unwrapPasskeyOptions({ state: 'abc', options: {} }),
        ).toThrow(/challenge missing/i);
    });

    it('rejects payloads without state', () => {
        expect(() =>
            unwrapPasskeyOptions({
                options: { challenge: 'x' },
            }),
        ).toThrow(/session expired/i);
    });
});
