import type { AppHref } from '@/types/href';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: AppHref): string {
    return typeof url === 'string' ? url : url.url;
}
