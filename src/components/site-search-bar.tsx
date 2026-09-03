'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type SiteSearchBarProps = {
    className?: string;
    defaultQuery?: string;
    compact?: boolean;
};

const SEARCH_COPY = {
    placeholder: 'Search Home Mart',
    aria: 'Search listings',
    button: 'Search',
} as const;

function resolveTranslation(
    translated: string,
    key: string,
    fallback: string,
): string {
    return translated === key ? fallback : translated;
}

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

    const placeholder = resolveTranslation(
        t('search.placeholder'),
        'search.placeholder',
        SEARCH_COPY.placeholder,
    );
    const ariaLabel = resolveTranslation(
        t('search.aria'),
        'search.aria',
        SEARCH_COPY.aria,
    );
    const buttonLabel = resolveTranslation(
        t('search.button'),
        'search.button',
        SEARCH_COPY.button,
    );

    const clear = () => {
        setQuery('');
        router.push('/');
        inputRef.current?.focus();
    };

    return (
        <form
            className={cn('relative w-full', className)}
            onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
            }}
        >
            <div className="relative flex min-w-0 items-center overflow-hidden rounded-full border border-primary/20 bg-card/95 shadow-sm transition-[box-shadow,border-color] focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/15">
                <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'min-w-0 flex-1 border-0 bg-transparent pl-4 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
                        compact ? 'py-2.5' : 'py-3',
                        query.trim()
                            ? compact
                                ? 'pr-20'
                                : 'pr-20'
                            : compact
                              ? 'pr-10'
                              : 'pr-11',
                    )}
                    aria-label={ariaLabel}
                />
                {query.trim() ? (
                    <button
                        type="button"
                        onClick={clear}
                        className={cn(
                            'absolute top-0 flex h-full items-center justify-center text-muted-foreground transition-colors hover:text-foreground',
                            compact ? 'right-10 w-8' : 'right-11 w-9',
                        )}
                        aria-label="Clear search"
                    >
                        <X className="size-3.5" />
                    </button>
                ) : null}
                <button
                    type="submit"
                    className={cn(
                        'absolute top-0 right-0 flex h-full items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10',
                        compact ? 'w-10' : 'w-11',
                    )}
                    aria-label={buttonLabel}
                >
                    <Search className="size-4 shrink-0" />
                </button>
            </div>
        </form>
    );
}
