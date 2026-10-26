export {
    browserSupportsWebAuthn,
    startAuthentication,
    startRegistration,
} from '@simplewebauthn/browser';
import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialRequestOptionsJSON,
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON,
} from '@simplewebauthn/browser';

/** Backend wraps WebAuthn options as `{ options, state }`. */
export type PasskeyOptionsEnvelope<T> = {
    options: T;
    state: string;
};

export type AuthenticationOptionsResponse =
    PasskeyOptionsEnvelope<PublicKeyCredentialRequestOptionsJSON>;

export type RegistrationOptionsResponse =
    PasskeyOptionsEnvelope<PublicKeyCredentialCreationOptionsJSON>;

export function unwrapPasskeyOptions(
    payload: unknown,
): { options: PublicKeyCredentialRequestOptionsJSON; state: string } {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid passkey options from server.');
    }

    const root = payload as Record<string, unknown>;
    const nested =
        root.options && typeof root.options === 'object'
            ? (root.options as Record<string, unknown>)
            : root;
    const challenge = nested.challenge;
    if (typeof challenge !== 'string' || !challenge) {
        throw new Error(
            'Passkey challenge missing. Refresh the page and try again.',
        );
    }

    const state =
        typeof root.state === 'string' && root.state.trim()
            ? root.state.trim()
            : '';
    if (!state) {
        throw new Error(
            'Passkey session expired. Refresh the page and try again.',
        );
    }

    return {
        options: nested as unknown as PublicKeyCredentialRequestOptionsJSON,
        state,
    };
}

export type { AuthenticationResponseJSON, RegistrationResponseJSON };
