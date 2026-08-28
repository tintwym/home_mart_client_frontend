'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { isAuthOverlayPath } from '@/lib/auth-overlay-paths';

export function useCloseAuthModal() {
    const router = useRouter();
    const pathname = usePathname();

    return useCallback(() => {
        if (!isAuthOverlayPath(pathname)) {
            router.replace('/');
            return;
        }

        // Soft-navigated modals: back dismisses the intercepted route cleanly.
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
        }

        router.replace('/');
    }, [pathname, router]);
}
