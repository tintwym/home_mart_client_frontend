'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import type { AppHref } from '@/types/href';

export type { AppHref };

export interface ApiPage<P = Record<string, unknown>> {
    props: P & { errors?: Record<string, unknown> };
    url: string;
}

const hrefToUrl = (href: AppHref): string =>
    typeof href === 'string' ? href : href.url;

function normalizeApiPath(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    const map: Record<string, string> = {
        '/login': '/api/login',
        '/register': '/api/register',
        '/logout': '/api/logout',
        '/forgot-password': '/api/forgot-password',
        '/reset-password': '/api/reset-password',
        '/email/verification-notification':
            '/api/email/verification-notification',
        '/user/confirm-password': '/api/user/confirm-password',
        '/two-factor-challenge': '/api/two-factor-challenge',
        '/auth/firebase': '/api/auth/firebase',
        '/passkeys/authentication-options':
            '/api/passkeys/authentication-options',
        '/passkeys/authenticate': '/api/passkeys/authenticate',
        '/user/password': '/api/user/password',
        '/password': '/api/password',
        '/profile': '/api/profile',
        '/settings/profile': '/api/profile',
        '/settings/password': '/api/user/password',
    };
    const pathOnly = url.split('?')[0];
    if (map[pathOnly]) {
        const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';
        return map[pathOnly] + qs;
    }
    if (
        pathOnly.startsWith('/api/') ||
        pathOnly.startsWith('/mapi/') ||
        pathOnly.startsWith('/storage/')
    ) {
        return url;
    }
    if (
        pathOnly.startsWith('/chat/') ||
        pathOnly.startsWith('/inbox/') ||
        pathOnly.startsWith('/cart') ||
        pathOnly.startsWith('/listings/') ||
        pathOnly.startsWith('/checkout') ||
        pathOnly.startsWith('/notifications') ||
        pathOnly.startsWith('/user/') ||
        pathOnly.startsWith('/settings/') ||
        pathOnly.startsWith('/orders') ||
        pathOnly.startsWith('/upgrades') ||
        pathOnly.startsWith('/favorites') ||
        pathOnly.startsWith('/conversations') ||
        pathOnly.startsWith('/passkeys/')
    ) {
        return `/api${url.startsWith('/') ? url : `/${url}`}`;
    }
    return url;
}

type VisitOptions = {
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: Record<string, unknown> | FormData;
    replace?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
    only?: string[];
    headers?: Record<string, string>;
    onSuccess?: (page: ApiPage) => void;
    onError?: (errors: Record<string, unknown>) => void;
    onFinish?: () => void;
    onStart?: () => void;
};

function isClientNav(url: string): boolean {
    const path = url.split('?')[0];
    return (
        !path.startsWith('/api/') &&
        !normalizeApiPath(url).startsWith('/api/') &&
        !/^https?:\/\//i.test(url)
    );
}

async function visit(href: AppHref, options: VisitOptions = {}): Promise<void> {
    const method = (options.method || 'get').toLowerCase() as NonNullable<
        VisitOptions['method']
    >;
    const rawUrl = hrefToUrl(href);
    options.onStart?.();

    try {
        if (method === 'get' && isClientNav(rawUrl)) {
            if (typeof window !== 'undefined') {
                if (options.replace) {
                    window.history.replaceState(null, '', rawUrl);
                } else {
                    window.location.assign(rawUrl);
                }
            }
            options.onSuccess?.({ props: {}, url: rawUrl });
            return;
        }

        const apiPath = normalizeApiPath(rawUrl);
        const isAbsolute = /^https?:\/\//i.test(apiPath);
        const pathForFetch = isAbsolute
            ? apiPath
            : apiPath.startsWith('/api')
              ? apiPath
              : `/api${apiPath.startsWith('/') ? apiPath : `/${apiPath}`}`;

        let body: unknown = options.data;
        if (method === 'get') {
            body = undefined;
        }

        try {
            const data = await apiFetch(pathForFetch, {
                method: method.toUpperCase(),
                body:
                    body instanceof FormData
                        ? undefined
                        : (body as Record<string, unknown> | undefined),
                rawBody: body instanceof FormData ? body : undefined,
                headers: options.headers,
            });

            if (
                data &&
                typeof data === 'object' &&
                'token' in data &&
                typeof (data as { token?: string }).token === 'string'
            ) {
                const { setToken } = await import('@/lib/api');
                setToken((data as { token: string }).token);
            }

            options.onSuccess?.({
                props: (data as Record<string, unknown>) ?? {},
                url: rawUrl,
            });

            if (
                method !== 'get' &&
                (pathForFetch.includes('/login') ||
                    pathForFetch.includes('/register') ||
                    pathForFetch.includes('/auth/firebase') ||
                    pathForFetch.includes('/passkeys/authenticate'))
            ) {
                if (typeof window !== 'undefined') {
                    window.location.assign('/');
                }
            }
        } catch (e) {
            if (e instanceof ApiError) {
                options.onError?.(
                    e.errors?.length
                        ? e.errors
                        : { message: e.message, ...e.errors },
                );
            } else {
                options.onError?.({
                    message:
                        e instanceof Error
                            ? e.message
                            : 'Network error. Please try again.',
                });
            }
        }
    } finally {
        options.onFinish?.();
    }
}

export const router = {
    visit: (href: AppHref, options: VisitOptions = {}) =>
        void visit(href, options),
    get: (href: AppHref, data?: VisitOptions['data'], options: VisitOptions = {}) =>
        void visit(href, { ...options, method: 'get', data }),
    post: (
        href: AppHref,
        data?: VisitOptions['data'],
        options: VisitOptions = {},
    ) => void visit(href, { ...options, method: 'post', data }),
    put: (href: AppHref, data?: VisitOptions['data'], options: VisitOptions = {}) =>
        void visit(href, { ...options, method: 'put', data }),
    patch: (
        href: AppHref,
        data?: VisitOptions['data'],
        options: VisitOptions = {},
    ) => void visit(href, { ...options, method: 'patch', data }),
    delete: (href: AppHref, options: VisitOptions = {}) =>
        void visit(href, { ...options, method: 'delete' }),
    reload: (options: VisitOptions = {}) => {
        const boot = (
            globalThis as unknown as {
                __hmBootstrapRefresh?: () => void;
            }
        ).__hmBootstrapRefresh;
        boot?.();
        options.onFinish?.();
    },
};

export interface AppLinkProps extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
> {
    href: AppHref;
    method?: string;
    data?: Record<string, unknown>;
    replace?: boolean;
    prefetch?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
    function Link(
        {
            href,
            method,
            data,
            prefetch: _prefetch,
            preserveScroll: _preserveScroll,
            preserveState: _preserveState,
            replace,
            onClick,
            children,
            ...rest
        },
        ref,
    ) {
        const url = hrefToUrl(href);
        const resolvedMethod = (
            method ||
            (typeof href === 'object' ? href.method : 'get') ||
            'get'
        ).toLowerCase();

        if (resolvedMethod !== 'get') {
            return (
                <a
                    ref={ref}
                    href={url}
                    onClick={(e) => {
                        onClick?.(e);
                        if (e.defaultPrevented) return;
                        e.preventDefault();
                        void visit(url, {
                            method: resolvedMethod as VisitOptions['method'],
                            data,
                        });
                    }}
                    {...rest}
                >
                    {children}
                </a>
            );
        }

        return (
            <NextLink
                ref={ref}
                href={url}
                replace={replace}
                {...rest}
                onClick={onClick}
            >
                {children}
            </NextLink>
        );
    },
);

interface FormRenderProps {
    processing: boolean;
    errors: Record<string, unknown>;
    recentlySuccessful: boolean;
    wasSuccessful: boolean;
    clearErrors: () => void;
    resetAndClearErrors: () => void;
}

export interface FormProps extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    'action' | 'method' | 'children' | 'onError'
> {
    action: AppHref;
    method?: string;
    children: ReactNode | ((props: FormRenderProps) => ReactNode);
    options?: { preserveScroll?: boolean; preserveState?: boolean };
    resetOnSuccess?: boolean | string[];
    resetOnError?: boolean | string[];
    transform?: (data: Record<string, unknown>) => Record<string, unknown>;
    onSuccess?: (page: ApiPage) => void;
    onError?: (errors: Record<string, unknown>) => void;
    onFinish?: () => void;
}

export function Form({
    action,
    method = 'post',
    children,
    options,
    resetOnSuccess,
    transform,
    onSuccess,
    onError,
    onFinish,
    ...rest
}: FormProps) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, unknown>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [wasSuccessful, setWasSuccessful] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearErrors = () => setErrors({});
    const resetAndClearErrors = () => {
        formRef.current?.reset();
        setErrors({});
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        formRef.current = form;
        const fd = new FormData(form);
        const obj: Record<string, unknown> = {};
        let containsFile = false;
        for (const [key, value] of fd.entries()) {
            if (typeof File !== 'undefined' && value instanceof File) {
                containsFile = true;
                break;
            }
            obj[key] = value;
        }
        const payload = containsFile
            ? fd
            : transform
              ? transform(obj)
              : obj;

        setProcessing(true);
        setErrors({});
        void visit(hrefToUrl(action), {
            method: (method || 'post').toLowerCase() as VisitOptions['method'],
            data: payload,
            preserveScroll: options?.preserveScroll,
            onSuccess: (page) => {
                setWasSuccessful(true);
                setRecentlySuccessful(true);
                if (successTimer.current) clearTimeout(successTimer.current);
                successTimer.current = setTimeout(
                    () => setRecentlySuccessful(false),
                    2000,
                );
                if (resetOnSuccess === true) form.reset();
                onSuccess?.(page);
            },
            onError: (errs) => {
                setErrors(errs);
                onError?.(errs);
            },
            onFinish: () => {
                setProcessing(false);
                onFinish?.();
            },
        });
    };

    useEffect(
        () => () => {
            if (successTimer.current) clearTimeout(successTimer.current);
        },
        [],
    );

    return (
        <form onSubmit={handleSubmit} {...rest}>
            {typeof children === 'function'
                ? children({
                      processing,
                      errors,
                      recentlySuccessful,
                      wasSuccessful,
                      clearErrors,
                      resetAndClearErrors,
                  })
                : children}
        </form>
    );
}
