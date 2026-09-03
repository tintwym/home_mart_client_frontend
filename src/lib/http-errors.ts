export type ShopErrorKind =
    | 'unauthorized'
    | 'forbidden'
    | 'not-found'
    | 'rate-limit'
    | 'error'
    | 'unavailable';

export type ShopErrorCopy = {
    kind: ShopErrorKind;
    code: string;
    title: string;
    description: string;
    retry?: boolean;
    signIn?: boolean;
};

export const SHOP_ERROR_COPY: Record<ShopErrorKind, ShopErrorCopy> = {
    unauthorized: {
        kind: 'unauthorized',
        code: '401',
        title: 'Sign in required',
        description:
            'You need to be signed in to see this page. Log in and we’ll bring you back.',
        signIn: true,
    },
    forbidden: {
        kind: 'forbidden',
        code: '403',
        title: 'You don’t have access',
        description:
            'This page is limited to the owner or an admin. Head home to keep browsing.',
    },
    'not-found': {
        kind: 'not-found',
        code: '404',
        title: 'Page not found',
        description:
            'That listing or page isn’t here. Check the link, or browse what’s available.',
    },
    'rate-limit': {
        kind: 'rate-limit',
        code: '429',
        title: 'Too many requests',
        description:
            'You’ve made too many requests in a short time. Wait a moment, then try again.',
        retry: true,
    },
    error: {
        kind: 'error',
        code: '500',
        title: 'Something went wrong',
        description:
            'This page hit a snag. Try again, or head home and keep browsing listings.',
        retry: true,
    },
    unavailable: {
        kind: 'unavailable',
        code: '503',
        title: 'Shop is temporarily unavailable',
        description:
            'We’re having trouble reaching the server. Try again in a little while.',
        retry: true,
    },
};

export function shopErrorKindFromStatus(status: number): ShopErrorKind {
    switch (status) {
        case 401:
            return 'unauthorized';
        case 403:
            return 'forbidden';
        case 404:
            return 'not-found';
        case 429:
            return 'rate-limit';
        case 503:
            return 'unavailable';
        default:
            return 'error';
    }
}
