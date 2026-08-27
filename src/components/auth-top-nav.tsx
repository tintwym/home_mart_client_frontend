'use client';

import Link from 'next/link';
import AppLogoIcon from '@/components/app-logo-icon';
import { SiteSearchBar } from '@/components/site-search-bar';
import { useSharedProps } from '@/lib/bootstrap';

export function AuthTopNav() {
    const { name } = useSharedProps();

    return (
        <header
            className="sticky top-0 z-50 border-b border-primary/15 bg-[var(--header-tint)] px-3 py-2 shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_12%,transparent)] backdrop-blur-md sm:px-4 md:px-6"
            style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
            <div className="mx-auto flex max-w-7xl items-center gap-3 md:gap-4">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
                >
                    <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                        <AppLogoIcon className="size-7" />
                    </span>
                    <span className="hidden text-sm sm:inline">{name}</span>
                </Link>
                <SiteSearchBar className="min-w-0 flex-1" compact />
            </div>
        </header>
    );
}
