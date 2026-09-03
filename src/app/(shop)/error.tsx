'use client';

import { ShopErrorScreen } from '@/components/shop-error-screen';

export default function ShopError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ShopErrorScreen kind="error" onRetry={reset} />;
}
