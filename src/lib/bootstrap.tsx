'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    getBootstrap,
    type BootstrapData,
} from '@/lib/api';
import type { SharedData } from '@/types';
import { useAuthOptional } from '@/lib/auth';

type BootstrapContextValue = {
    data: BootstrapData | null;
    shared: SharedData;
    loading: boolean;
    error: string | null;
    refresh: (params?: {
        region?: string;
        currency?: string;
        locale?: string;
    }) => Promise<void>;
};

const emptyShared: SharedData = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart',
    auth: {
        user: null,
        cartListingIds: [],
        favoriteListingIds: [],
        chatUnreadCount: 0,
    },
    sidebarOpen: false,
    categories: [],
    categoryTree: [],
    locations: [],
    translations: {},
    locale: 'en',
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

function toShared(data: BootstrapData | null, appName: string): SharedData {
    if (!data) return { ...emptyShared, name: appName };

    const authUser = data.auth?.user ?? null;
    const cartIds = (data.auth?.cart_listing_ids ?? []) as string[];
    const favIds = (data.auth?.favorite_listing_ids ?? []) as string[];
    const unread = Number(data.auth?.unread_messages ?? 0);

    let currency = data.currency as SharedData['currency'];
    if (typeof data.currency === 'string' && data.currencies) {
        currency = (data.currencies as Record<string, SharedData['currency']>)[
            data.currency
        ] as SharedData['currency'];
    }

    return {
        name: appName,
        auth: {
            user: authUser as SharedData['auth']['user'],
            cartListingIds: cartIds,
            favoriteListingIds: favIds,
            cartCount: cartIds.length,
            chatUnreadCount: unread,
        },
        sidebarOpen: false,
        categories: (data.categories ?? []) as SharedData['categories'],
        categoryTree: (data.category_tree ??
            []) as SharedData['categoryTree'],
        locations: (data.locations ?? []) as SharedData['locations'],
        region: data.region,
        currency,
        currencies: data.currencies as SharedData['currencies'],
        exchangeRates: data.exchange_rates,
        locale: data.locale ?? 'en',
        translations: data.translations ?? {},
        regionLabel:
            data.region && data.region_labels
                ? data.region_labels[data.region]
                : undefined,
    };
}

export function BootstrapProvider({ children }: { children: ReactNode }) {
    const auth = useAuthOptional();
    const [data, setData] = useState<BootstrapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart';

    const refresh = useCallback(
        async (params?: {
            region?: string;
            currency?: string;
            locale?: string;
        }) => {
            setLoading(true);
            setError(null);
            try {
                const boot = await getBootstrap(params);
                setData(boot);
                if (boot.auth?.user && auth?.setSession && auth.token) {
                    // keep auth user in sync when bootstrap has fresher user
                    // without overwriting token
                }
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : 'Failed to load bootstrap',
                );
            } finally {
                setLoading(false);
            }
        },
        [auth?.token],
    );

    useEffect(() => {
        void refresh();
    }, [refresh, auth?.token]);

    useEffect(() => {
        (
            globalThis as unknown as {
                __hmBootstrapRefresh?: () => void;
            }
        ).__hmBootstrapRefresh = () => {
            void refresh();
        };
        return () => {
            delete (
                globalThis as unknown as {
                    __hmBootstrapRefresh?: () => void;
                }
            ).__hmBootstrapRefresh;
        };
    }, [refresh]);

    const shared = useMemo(() => {
        const base = toShared(data, appName);
        if (auth?.user) {
            return {
                ...base,
                auth: {
                    ...base.auth,
                    user: auth.user as SharedData['auth']['user'],
                },
            };
        }
        return base;
    }, [data, appName, auth?.user]);

    const value = useMemo(
        () => ({ data, shared, loading, error, refresh }),
        [data, shared, loading, error, refresh],
    );

    return (
        <BootstrapContext.Provider value={value}>
            {children}
        </BootstrapContext.Provider>
    );
}

export function useBootstrap(): BootstrapContextValue {
    const ctx = useContext(BootstrapContext);
    if (!ctx) {
        throw new Error('useBootstrap must be used within BootstrapProvider');
    }
    return ctx;
}

export function useBootstrapOptional(): BootstrapContextValue | null {
    return useContext(BootstrapContext);
}

export function useSharedProps(): SharedData {
    const ctx = useBootstrapOptional();
    return ctx?.shared ?? emptyShared;
}
