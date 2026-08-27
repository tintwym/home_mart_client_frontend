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
    apiFetch,
    clearToken,
    firebaseLogin as apiFirebaseLogin,
    getToken,
    getUser,
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    setToken,
    type AuthUser,
} from '@/lib/api';

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    token: string | null;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (payload: {
        name: string;
        email: string;
        password: string;
        password_confirmation?: string;
        seller_type?: string;
        region?: string;
    }) => Promise<AuthUser>;
    loginWithFirebase: (idToken: string, region?: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refresh: () => Promise<AuthUser | null>;
    setSession: (user: AuthUser, token: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const setSession = useCallback((nextUser: AuthUser, nextToken: string) => {
        setToken(nextToken);
        setTokenState(nextToken);
        setUser(nextUser);
    }, []);

    const refresh = useCallback(async () => {
        const t = getToken();
        setTokenState(t);
        if (!t) {
            setUser(null);
            return null;
        }
        try {
            const u = await getUser();
            setUser(u);
            return u;
        } catch {
            clearToken();
            setTokenState(null);
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        void (async () => {
            setLoading(true);
            await refresh();
            setLoading(false);
        })();
    }, [refresh]);

    const login = useCallback(
        async (email: string, password: string) => {
            const res = await apiLogin(email, password);
            setSession(res.user, res.token);
            return res.user;
        },
        [setSession],
    );

    const register = useCallback(
        async (payload: {
            name: string;
            email: string;
            password: string;
            password_confirmation?: string;
            seller_type?: string;
            region?: string;
        }) => {
            const res = await apiRegister(payload);
            setSession(res.user, res.token);
            return res.user;
        },
        [setSession],
    );

    const loginWithFirebase = useCallback(
        async (idToken: string, region?: string) => {
            const res = await apiFirebaseLogin(idToken, region);
            setSession(res.user, res.token);
            return res.user;
        },
        [setSession],
    );

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            clearToken();
        }
        setTokenState(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            token,
            login,
            register,
            loginWithFirebase,
            logout,
            refresh,
            setSession,
        }),
        [
            user,
            loading,
            token,
            login,
            register,
            loginWithFirebase,
            logout,
            refresh,
            setSession,
        ],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}

/** Optional hook that does not throw outside provider (for compat shims). */
export function useAuthOptional(): AuthContextValue | null {
    return useContext(AuthContext);
}

export async function ensureAuthenticated(): Promise<AuthUser> {
    return apiFetch<AuthUser>('/api/user');
}
