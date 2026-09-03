/** Safe post-login path from `?next=` (same-origin relative paths only). */
export function resolveAuthNext(
    next: string | null | undefined,
    fallback = '/',
): string {
    if (!next) return fallback;
    const value = next.trim();
    if (!value.startsWith('/') || value.startsWith('//')) return fallback;
    if (value.includes('://')) return fallback;
    return value;
}

export function loginHref(returnTo?: string): string {
    if (!returnTo || returnTo === '/login' || returnTo.startsWith('/login?')) {
        return '/login';
    }
    return `/login?next=${encodeURIComponent(returnTo)}`;
}
