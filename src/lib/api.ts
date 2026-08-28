const TOKEN_KEY = 'hm_token';

function normalizeBase(url: string): string {
    return url.replace(/\/$/, '');
}

/**
 * When the browser runs on a different origin than a localhost API URL (e.g. Next on
 * :3000 with Spring on :5199), use same-origin /api so Next rewrites still work even
 * if the JVM backend is down or NEXT_PUBLIC_API_URL is stale.
 */
function shouldUseSameOriginProxy(configured: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const api = new URL(configured);
        if (api.hostname !== 'localhost' && api.hostname !== '127.0.0.1') {
            return false;
        }
        const pageHost = window.location.hostname;
        if (pageHost !== 'localhost' && pageHost !== '127.0.0.1') {
            return false;
        }
        const apiPort = api.port || (api.protocol === 'https:' ? '443' : '80');
        const pagePort =
            window.location.port ||
            (window.location.protocol === 'https:' ? '443' : '80');
        return apiPort !== pagePort;
    } catch {
        return false;
    }
}

/** Resolved per-request so browser can use same-origin /api (Vercel rewrites). */
export function getApiBase(): string {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (typeof window !== 'undefined') {
        if (!configured) return '';
        if (shouldUseSameOriginProxy(configured)) return '';
        return normalizeBase(configured);
    }
    if (configured) {
        return normalizeBase(configured);
    }
    return normalizeBase(process.env.BACKEND_URL || 'http://localhost:5199');
}

/** @deprecated use getApiBase() — kept for callers that read a string at import time */
export const API_URL =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL?.trim()) ||
    (typeof window !== 'undefined' ? '' : process.env.BACKEND_URL || 'http://localhost:5199');

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
    status: number;
    errors: Record<string, unknown>;
    body: unknown;

    constructor(
        message: string,
        status: number,
        body?: unknown,
        errors: Record<string, unknown> = {},
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.errors = errors;
    }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
    auth?: boolean;
    rawBody?: BodyInit | null;
};

function resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const base = getApiBase();
    const p = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${p}` : p;
}

export async function apiFetch<T = unknown>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const { body, auth = true, rawBody, headers: initHeaders, ...rest } = options;
    const headers = new Headers(initHeaders);

    if (auth) {
        const token = getToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    let finalBody: BodyInit | undefined | null = rawBody;
    if (rawBody === undefined && body !== undefined && body !== null) {
        if (body instanceof FormData) {
            finalBody = body;
        } else {
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
            finalBody = JSON.stringify(body);
        }
    }

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    const res = await fetch(resolveUrl(path), {
        ...rest,
        headers,
        body: finalBody === null ? undefined : finalBody,
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        const obj = (data && typeof data === 'object' ? data : {}) as Record<
            string,
            unknown
        >;
        const message =
            (typeof obj.message === 'string' && obj.message) ||
            `Request failed (${res.status})`;
        const errors =
            obj.errors && typeof obj.errors === 'object'
                ? (obj.errors as Record<string, unknown>)
                : {};
        throw new ApiError(message, res.status, data, errors);
    }

    return data as T;
}

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    region?: string | null;
    avatar?: string | null;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    two_factor_confirmed_at?: string | null;
    [key: string]: unknown;
};

export function normalizeAuthUser(user: AuthUser): AuthUser {
    return {
        ...user,
        two_factor_enabled: Boolean(
            user.two_factor_enabled ?? user.two_factor_confirmed_at,
        ),
    };
}

export type TokenResponse = {
    user: AuthUser;
    token: string;
};

export type BootstrapAuth = {
    user: AuthUser | null;
    cart_listing_ids?: string[];
    favorite_listing_ids?: string[];
    unread_messages?: number;
};

export type BootstrapData = {
    auth: BootstrapAuth;
    region?: string;
    currency?: string | Record<string, unknown>;
    locale?: string;
    categories?: unknown[];
    category_tree?: unknown[];
    locations?: unknown[];
    currencies?: Record<string, unknown>;
    exchange_rates?: Record<string, number>;
    regions?: string[];
    region_labels?: Record<string, string>;
    translations?: Record<string, string>;
    [key: string]: unknown;
};

export async function getBootstrap(params?: {
    region?: string;
    currency?: string;
    locale?: string;
}): Promise<BootstrapData> {
    const q = new URLSearchParams();
    if (params?.region) q.set('region', params.region);
    if (params?.currency) q.set('currency', params.currency);
    if (params?.locale) q.set('locale', params.locale);
    const qs = q.toString();
    return apiFetch<BootstrapData>(`/api/bootstrap${qs ? `?${qs}` : ''}`, {
        auth: true,
    });
}

export async function getUser(): Promise<AuthUser> {
    const user = await apiFetch<AuthUser>('/api/user');
    return normalizeAuthUser(user);
}

export async function login(
    email: string,
    password: string,
): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
    });
}

export async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation?: string;
    seller_type?: string;
    region?: string;
}): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/register', {
        method: 'POST',
        auth: false,
        body: payload,
    });
}

export async function firebaseLogin(
    idToken: string,
    region?: string,
): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/auth/firebase', {
        method: 'POST',
        auth: false,
        body: { id_token: idToken, ...(region ? { region } : {}) },
    });
}

export async function logout(): Promise<void> {
    try {
        await apiFetch('/api/logout', { method: 'POST' });
    } finally {
        clearToken();
    }
}

export async function getListings(
    params?: Record<string, string | number | undefined>,
): Promise<{ data?: unknown[]; listings?: unknown[]; [key: string]: unknown }> {
    const q = new URLSearchParams();
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
        }
    }
    const qs = q.toString();
    return apiFetch(`/api/listings${qs ? `?${qs}` : ''}`);
}

export type ListingReview = {
    id: string;
    rating?: number;
    comment?: string | null;
    created_at?: string;
    user?: { id: string; name: string } | null;
};

export type ListingDetail = {
    id: string;
    user_id?: string;
    subcategory_id?: string | null;
    title: string;
    description?: string | null;
    condition?: string;
    price?: number;
    meetup_location?: string | null;
    image_url?: string | null;
    image_path?: string | null;
    is_sold?: boolean;
    is_trending?: boolean;
    views_count?: number;
    category?: { id: string; name: string; slug: string } | null;
    seller?: { id: string; name: string; region?: string | null } | null;
    user?: { id: string; name: string; region?: string | null } | null;
    average_rating?: number;
    review_count?: number;
    reviews?: ListingReview[];
    related_listings?: Record<string, unknown>[];
};

export function resolveListingImage(listing: {
    image_url?: string | null;
    image_path?: string | null;
}): string | null {
    const raw = listing.image_url ?? listing.image_path ?? null;
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/storage/') || raw.startsWith('/api/')) return raw;
    if (raw.startsWith('/')) return raw;
    return `/storage/${raw.replace(/^\/+/, '')}`;
}

function unwrapListingPayload(payload: unknown): ListingDetail {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid listing response');
    }
    const record = payload as Record<string, unknown>;
    if (record.data && typeof record.data === 'object') {
        return record.data as ListingDetail;
    }
    if (record.listing && typeof record.listing === 'object') {
        return record.listing as ListingDetail;
    }
    return record as ListingDetail;
}

export async function getListing(id: string): Promise<ListingDetail> {
    const payload = await apiFetch<unknown>(`/api/listings/${id}`);
    return unwrapListingPayload(payload);
}

export async function getCategories(): Promise<unknown> {
    return apiFetch('/api/categories');
}

export async function getCart(): Promise<{ items: unknown[] }> {
    return apiFetch('/api/cart');
}

export async function getFavorites(): Promise<unknown> {
    return apiFetch('/api/favorites');
}

export async function getConversations(): Promise<unknown> {
    return apiFetch('/api/conversations');
}

export async function getConversationMessages(id: string): Promise<unknown> {
    return apiFetch(`/api/conversations/${id}/messages`);
}

export async function getOrders(): Promise<unknown> {
    return apiFetch('/api/orders');
}

export async function getUserProfile(id: string): Promise<unknown> {
    return apiFetch(`/api/users/${id}`);
}

export async function getUpgrades(): Promise<unknown> {
    return apiFetch('/api/upgrades');
}

export async function forgotPassword(email: string): Promise<unknown> {
    return apiFetch('/api/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email },
    });
}

export async function resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<unknown> {
    return apiFetch('/api/reset-password', {
        method: 'POST',
        auth: false,
        body: payload,
    });
}

export async function confirmTwoFactor(payload: {
    email: string;
    password: string;
    code?: string;
    recoveryCode?: string;
}): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/two-factor-challenge', {
        method: 'POST',
        auth: false,
        body: payload,
    });
}
