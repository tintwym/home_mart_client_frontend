export const AUTH_OVERLAY_PATHS = new Set([
    '/login',
    '/register',
    '/forgot-password',
]);

export function isAuthOverlayPath(pathname: string | null): boolean {
    return pathname != null && AUTH_OVERLAY_PATHS.has(pathname);
}
