'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

const AUTH_OVERLAY_PATHS = new Set([
    '/login',
    '/register',
    '/forgot-password',
]);

export function useCloseAuthModal() {
    const router = useRouter();
    const pathname = usePathname();

    return useCallback(() => {
        if (pathname && AUTH_OVERLAY_PATHS.has(pathname)) {
            router.replace('/');
            return;
        }
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
        }
        router.replace('/');
    }, [pathname, router]);
}
