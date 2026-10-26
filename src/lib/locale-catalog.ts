/**
 * Bundled locale catalogs so the UI never flashes raw keys while /api/bootstrap
 * is still loading (or when Render is cold-starting).
 *
 * Bootstrap translations still win when present (server is source of truth).
 */
import en from '../../public/locales/en.json';
import ja from '../../public/locales/ja.json';
import my from '../../public/locales/my.json';
import vi from '../../public/locales/vi.json';
import zh from '../../public/locales/zh.json';

export type LocaleCatalog = Record<string, string>;

const CATALOGS: Record<string, LocaleCatalog> = {
    en: en as LocaleCatalog,
    ja: ja as LocaleCatalog,
    my: my as LocaleCatalog,
    vi: vi as LocaleCatalog,
    zh: zh as LocaleCatalog,
};

export const SUPPORTED_LOCALES = Object.keys(CATALOGS);

export function getLocaleCatalog(locale?: string | null): LocaleCatalog {
    if (locale && CATALOGS[locale]) {
        return CATALOGS[locale];
    }
    return CATALOGS.en;
}

/** Merge static catalog under bootstrap/server translations. */
export function mergeTranslations(
    locale: string | null | undefined,
    server?: LocaleCatalog | null,
): LocaleCatalog {
    const base = getLocaleCatalog(locale);
    if (!server || Object.keys(server).length === 0) {
        return base;
    }
    return { ...base, ...server };
}
