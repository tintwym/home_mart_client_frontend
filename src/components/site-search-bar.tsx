'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type SiteSearchBarProps = {
    className?: string;
    defaultQuery?: string;
    compact?: boolean;
};

export function SiteSearchBar({
    className,
    defaultQuery = '',
    compact = false,
}: SiteSearchBarProps) {
    const router = useRouter();
    const { t } = useTranslations();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(defaultQuery);

    useEffect(() => {
        setQuery(defaultQuery);
    }, [defaultQuery]);

    return (
        <form
            className={cn('relative w-full', className)}
            onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
            }}
        >
            <div className="relative flex min-w-0 items-center overflow-hidden rounded-lg border border-primary/20 bg-card shadow-xs">
                <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className={cn(
                        'min-w-0 flex-1 border-0 bg-transparent pl-3 text-sm outline-none placeholder:text-muted-foreground',
                        compact ? 'py-2 pr-9' : 'py-2.5 pr-10 md:pl-4',
                    )}
                    aria-label={t('search.aria')}
                />
                <button
                    type="submit"
                    className={cn(
                        'absolute top-0 right-0 flex h-full items-center justify-center bg-transparent text-muted-foreground transition-colors hover:text-foreground',
                        compact ? 'w-9' : 'w-10',
                    )}
                    aria-label={t('search.button')}
                >
                    <Search className="size-4 shrink-0 md:size-5" />
                </button>
            </div>
        </form>
    );
}
