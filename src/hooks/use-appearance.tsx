import { useSyncExternalStore } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type ResolvedAppearance = 'light' | 'dark';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/** Theme always follows the OS; manual light/dark overrides are ignored. */
const getAppearance = (): Appearance => 'system';

const getResolvedAppearance = (): ResolvedAppearance =>
    prefersDark() ? 'dark' : 'light';

const applyTheme = (): void => {
    if (typeof document === 'undefined') return;

    const resolved = getResolvedAppearance();
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const handleSystemThemeChange = (): void => {
    applyTheme();
    notify();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') return;

    // Drop any old manual preference so OS theme always wins.
    try {
        localStorage.removeItem('appearance');
    } catch {
        // ignore
    }

    applyTheme();
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance = useSyncExternalStore(
        subscribe,
        getAppearance,
        () => 'system' as Appearance,
    );

    const resolvedAppearance = useSyncExternalStore(
        subscribe,
        getResolvedAppearance,
        () => 'light' as ResolvedAppearance,
    );

    const updateAppearance = (_mode: Appearance) => {
        void _mode;
        // No-op: appearance is driven by prefers-color-scheme only.
        applyTheme();
        notify();
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
