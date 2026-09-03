import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShopTrustStripProps = {
    className?: string;
    message?: string;
};

export function ShopTrustStrip({
    className,
    message = 'Secure checkout · Message seller anytime',
}: ShopTrustStripProps) {
    return (
        <p
            className={cn(
                'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
                className,
            )}
        >
            <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span>{message}</span>
        </p>
    );
}
