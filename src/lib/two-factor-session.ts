const EMAIL_KEY = 'hm_2fa_email';
const PASSWORD_KEY = 'hm_2fa_password';

export function saveTwoFactorCredentials(email: string, password: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(EMAIL_KEY, email);
    sessionStorage.setItem(PASSWORD_KEY, password);
}

export function readTwoFactorCredentials(): {
    email: string;
    password: string;
} | null {
    if (typeof sessionStorage === 'undefined') return null;
    const email = sessionStorage.getItem(EMAIL_KEY);
    const password = sessionStorage.getItem(PASSWORD_KEY);
    if (!email || !password) return null;
    return { email, password };
}

export function clearTwoFactorCredentials(): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(EMAIL_KEY);
    sessionStorage.removeItem(PASSWORD_KEY);
}
