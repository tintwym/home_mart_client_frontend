'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ClientRouter = {
    push: (url: string) => void;
    replace: (url: string) => void;
};

let clientRouter: ClientRouter | null = null;

export function registerClientRouter(router: ClientRouter | null): void {
    clientRouter = router;
}

export function getClientRouter(): ClientRouter | null {
    return clientRouter;
}

export function NavigationBridge() {
    const router = useRouter();

    useEffect(() => {
        registerClientRouter(router);
        return () => registerClientRouter(null);
    }, [router]);

    return null;
}
