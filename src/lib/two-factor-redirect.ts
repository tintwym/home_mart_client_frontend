import { ApiError } from '@/lib/api';

export function isTwoFactorRequired(error: unknown): boolean {
    if (!(error instanceof ApiError)) return false;
    if (error.errors.two_factor_required === true) return true;
    if (error.errors.two_factor) return true;
    return error.message.toLowerCase().includes('two factor');
}

export const TWO_FACTOR_EMAIL_HINT =
    'Two-factor authentication is enabled. Sign in with your email and password to continue.';
