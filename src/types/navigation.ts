import type { AppHref } from '@/types/href';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    href: AppHref;
    icon?: LucideIcon | null;
    isActive?: boolean;
};
