'use client';

import { useMemo } from 'react';
import { useSharedProps } from '@/lib/bootstrap';
import { mergeTranslations } from '@/lib/locale-catalog';

type Translations = Record<string, string>;

export function useTranslations() {
    const props = useSharedProps();
    const locale = props.locale ?? 'en';
    const translations: Translations = useMemo(
        () => mergeTranslations(locale, props.translations),
        [locale, props.translations],
    );

    function t(key: string, params?: Record<string, string | number>): string {
        let value = translations[key] ?? key;
        if (params) {
            const entries = Object.entries(params).sort(
                (a, b) => b[0].length - a[0].length,
            );
            for (const [k, v] of entries) {
                const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                value = value.replace(
                    new RegExp(`:${escaped}\\b`, 'g'),
                    String(v),
                );
            }
        }
        return value;
    }

    function categoryName(cat: { name: string; slug: string }): string {
        const key = 'category.' + cat.slug;
        return translations[key] ?? cat.name;
    }

    return { t, categoryName, locale, translations };
}
