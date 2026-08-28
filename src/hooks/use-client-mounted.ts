'use client';

import { useEffect, useState } from 'react';

/** True after the first client paint — use to gate browser-only UI and avoid hydration mismatches. */
export function useClientMounted(): boolean {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
