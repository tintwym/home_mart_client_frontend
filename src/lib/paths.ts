/** Next.js App Router page paths. */
export const paths = {
    home: '/',
    login: '/login',
    register: '/register',
    logout: '/logout',
    settings: {
        root: '/settings',
        profile: '/settings/profile',
        password: '/settings/password',
        payment: '/settings/payment',
        twoFactor: '/settings/two-factor',
        orders: '/settings/orders',
    },
} as const;

/** Backend REST paths (prefixed with /api when fetched). */
export const apiPaths = {
    profileDestroy: '/settings/profile',
    twoFactorRecoveryCodes: '/user/two-factor-recovery-codes',
    twoFactorQrCode: '/user/two-factor-qr-code',
    twoFactorSecretKey: '/user/two-factor-secret-key',
    twoFactorConfirm: '/user/confirmed-two-factor-authentication',
} as const;
