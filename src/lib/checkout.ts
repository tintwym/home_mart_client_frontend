import { apiFetch } from '@/lib/api';

export type CheckoutOrder = {
    id: string;
    status?: string;
    total?: number;
};

export type CheckoutResponse = {
    order: CheckoutOrder;
    payment_flow: string;
    flow_region?: string;
};

export function checkoutPathForFlow(
    paymentFlow: string,
    orderId: string,
): string {
    switch (paymentFlow) {
        case 'c2c_mm':
            return `/checkout/myanmar?orderId=${encodeURIComponent(orderId)}`;
        case 'c2c_vn':
            return `/checkout/vietnam?orderId=${encodeURIComponent(orderId)}`;
        default:
            return `/checkout/stripe?orderId=${encodeURIComponent(orderId)}`;
    }
}

export async function createCheckoutOrder(
    region?: string,
): Promise<CheckoutResponse> {
    const qs = region ? `?region=${encodeURIComponent(region)}` : '';
    return apiFetch<CheckoutResponse>(`/api/checkout${qs}`, {
        method: 'POST',
        body: {},
    });
}

export async function startCheckout(router: {
    push: (url: string) => void;
}): Promise<CheckoutResponse> {
    const res = await createCheckoutOrder();
    const orderId = res.order?.id;
    if (!orderId) {
        throw new Error('Checkout did not return an order id.');
    }
    router.push(checkoutPathForFlow(res.payment_flow, orderId));
    return res;
}

export async function startStripeCheckout(orderId: string): Promise<string> {
    const res = await apiFetch<{ url?: string; checkout_url?: string }>(
        '/api/checkout/stripe',
        { method: 'POST', body: { orderId } },
    );
    const url = res.url || res.checkout_url;
    if (!url) {
        throw new Error('No Stripe checkout URL returned.');
    }
    return url;
}

export async function submitLocalPayment(
    region: 'MM' | 'VN',
    orderId: string,
    method: string,
    identifier: string,
): Promise<unknown> {
    const path =
        region === 'MM' ? '/api/checkout/mm/pay' : '/api/checkout/vn/pay';
    return apiFetch(path, {
        method: 'POST',
        body: { orderId, method, identifier },
    });
}

export async function arrangeMeetup(
    region: 'MM' | 'VN',
    orderId: string,
): Promise<unknown> {
    const path =
        region === 'MM'
            ? '/api/checkout/mm/arrange'
            : '/api/checkout/vn/arrange';
    return apiFetch(path, { method: 'POST', body: { orderId } });
}

export async function confirmStripeSession(sessionId: string): Promise<{
    message?: string;
    order_id?: string;
}> {
    return apiFetch('/api/checkout/success', {
        method: 'POST',
        body: { sessionId },
    });
}

export type MyanmarCheckoutData = {
    order: {
        id: string;
        status?: string;
        total?: number;
        total_mmk?: number;
        items?: Array<{
            id: string;
            listing?: { id: string; title?: string; price?: number };
        }>;
    };
    mmqr: {
        payload: string;
        amount_mmk: number | string;
        currency: string;
        merchant_name: string;
        merchant_id?: string;
        merchant_city?: string;
        bill_number?: string;
    };
    payment_methods: string[];
    default_method?: string;
    merchant?: { name?: string; city?: string };
    test_mode?: boolean;
    region?: string;
};

export async function fetchMyanmarCheckout(
    orderId: string,
): Promise<MyanmarCheckoutData> {
    return apiFetch<MyanmarCheckoutData>(
        `/api/checkout/mm?orderId=${encodeURIComponent(orderId)}`,
    );
}

export function mmqrImageUrl(payload: string, size = 280): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
}

export function unwrapCreatedListingId(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') return null;
    const record = payload as Record<string, unknown>;
    if (typeof record.id === 'string') return record.id;
    if (record.data && typeof record.data === 'object') {
        const id = (record.data as { id?: unknown }).id;
        if (typeof id === 'string') return id;
    }
    if (record.listing && typeof record.listing === 'object') {
        const id = (record.listing as { id?: unknown }).id;
        if (typeof id === 'string') return id;
    }
    return null;
}
