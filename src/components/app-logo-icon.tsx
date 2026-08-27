import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/favicon.svg"
            alt="Home Mart"
            {...props}
            className={cn('object-contain', className)}
        />
    );
}
