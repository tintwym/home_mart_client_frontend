'use client';

/**
 * Drop-in compatibility layer for @/lib/inertia-compat during the Next.js migration.
 * Pages/components still importing Inertia APIs resolve here via tsconfig paths.
 */
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch, ApiError, API_URL } from '@/lib/api';
import { useSharedProps, useBootstrapOptional } from '@/lib/bootstrap';
import { useAuthOptional } from '@/lib/auth';

export interface Page<P = Record<string, unknown>> {
    component: string;
    props: P & { errors?: Record<string, unknown> };
    url: string;
    version: string | null;
}

type Href =
    | string
    | {
          url: string;
          method?: string;
      };

const hrefToUrl = (href: Href): string =>
    typeof href === 'string' ? href : href.url;

function normalizeApiPath(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    // Map legacy Inertia form paths to REST API
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
    // Chat / inbox / cart JSON endpoints → /api/*
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
    forceFormData?: boolean;
    onSuccess?: (page: Page) => void;
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

async function visit(href: Href, options: VisitOptions = {}): Promise<void> {
    const method = (options.method || 'get').toLowerCase() as NonNullable<
        VisitOptions['method']
    >;
    const rawUrl = hrefToUrl(href);
    options.onStart?.();

    try {
        // Soft client navigation for GET page routes
        if (method === 'get' && isClientNav(rawUrl)) {
            if (typeof window !== 'undefined') {
                if (options.replace) {
                    window.history.replaceState(null, '', rawUrl);
                } else {
                    window.location.assign(rawUrl);
                }
            }
            options.onSuccess?.({
                component: '',
                props: {},
                url: rawUrl,
                version: null,
            });
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

            // Token responses from login/register
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
                component: '',
                props: (data as Record<string, unknown>) ?? {},
                url: rawUrl,
                version: null,
            });

            // After mutating auth, go home
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
                options.onError?.(e.errors?.length ? e.errors : { message: e.message, ...e.errors });
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
    visit: (href: Href, options: VisitOptions = {}) => void visit(href, options),
    get: (href: Href, data?: VisitOptions['data'], options: VisitOptions = {}) =>
        void visit(href, { ...options, method: 'get', data }),
    post: (
        href: Href,
        data?: VisitOptions['data'],
        options: VisitOptions = {},
    ) => void visit(href, { ...options, method: 'post', data }),
    put: (href: Href, data?: VisitOptions['data'], options: VisitOptions = {}) =>
        void visit(href, { ...options, method: 'put', data }),
    patch: (
        href: Href,
        data?: VisitOptions['data'],
        options: VisitOptions = {},
    ) => void visit(href, { ...options, method: 'patch', data }),
    delete: (href: Href, options: VisitOptions = {}) =>
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

export function usePage<T = Record<string, unknown>>(): Page<T> {
    const shared = useSharedProps();
    const pathname = usePathname() || '/';
    return {
        component: '',
        props: shared as unknown as T & { errors?: Record<string, unknown> },
        url: pathname,
        version: null,
    };
}

export function Head({
    title,
    children,
}: {
    title?: string;
    children?: ReactNode;
}) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart';
    useEffect(() => {
        if (title !== undefined) {
            document.title = title ? `${title} - ${appName}` : appName;
        }
    }, [title, appName]);
    void children;
    return null;
}

export interface InertiaLinkProps extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
> {
    href: Href;
    method?: string;
    data?: Record<string, unknown>;
    as?: string;
    preserveScroll?: boolean;
    preserveState?: boolean;
    prefetch?: boolean | string | string[];
    cacheFor?: number | string | Array<number | string>;
    only?: string[];
    except?: string[];
    headers?: Record<string, string>;
    replace?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, InertiaLinkProps>(
    function Link(
        {
            href,
            method,
            data,
            as: _as,
            preserveScroll: _ps,
            preserveState: _pst,
            prefetch: _prefetch,
            cacheFor: _cacheFor,
            only: _only,
            except: _except,
            headers: _headers,
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
            <NextLink ref={ref} href={url} replace={replace} {...rest} onClick={onClick}>
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
    action: Href;
    method?: string;
    children: ReactNode | ((props: FormRenderProps) => ReactNode);
    options?: { preserveScroll?: boolean; preserveState?: boolean };
    resetOnSuccess?: boolean | string[];
    resetOnError?: boolean | string[];
    disableWhileProcessing?: boolean;
    transform?: (data: Record<string, unknown>) => Record<string, unknown>;
    onSuccess?: (page: Page) => void;
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

export function useForm<T extends Record<string, unknown> = Record<string, unknown>>(
    initial?: T,
) {
    const initialRef = useRef<T>((initial ?? {}) as T);
    const [data, setDataState] = useState<T>(() => initialRef.current);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, unknown>>({});
    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    function setData(key: keyof T | Partial<T>, value?: unknown) {
        if (typeof key === 'object') {
            setDataState((prev) => ({ ...prev, ...(key as Partial<T>) }));
        } else {
            setDataState((prev) => ({ ...prev, [key]: value }));
        }
    }

    function submit(
        method: NonNullable<VisitOptions['method']>,
        url: Href,
        opts: VisitOptions = {},
    ) {
        setProcessing(true);
        setErrors({});
        void visit(hrefToUrl(url), {
            ...opts,
            method,
            data: dataRef.current,
            onSuccess: (page) => opts.onSuccess?.(page),
            onError: (errs) => {
                setErrors(errs);
                opts.onError?.(errs);
            },
            onFinish: () => {
                setProcessing(false);
                opts.onFinish?.();
            },
        });
    }

    return {
        data,
        setData,
        processing,
        errors,
        post: (url: Href, opts?: VisitOptions) => submit('post', url, opts),
        put: (url: Href, opts?: VisitOptions) => submit('put', url, opts),
        patch: (url: Href, opts?: VisitOptions) => submit('patch', url, opts),
        delete: (url: Href, opts?: VisitOptions) => submit('delete', url, opts),
        get: (url: Href, opts?: VisitOptions) => submit('get', url, opts),
        reset: (...keys: (keyof T)[]) => {
            if (keys.length === 0) {
                setDataState(initialRef.current);
            } else {
                setDataState((prev) => {
                    const next = { ...prev };
                    for (const k of keys) next[k] = initialRef.current[k];
                    return next;
                });
            }
        },
        clearErrors: () => setErrors({}),
        setError: (key: string, message: string) =>
            setErrors((prev) => ({ ...prev, [key]: message })),
    };
}

export async function createInertiaApp(): Promise<void> {
    // No-op under Next.js App Router
}

// Silence unused import warnings in some bundlers
void API_URL;
void useCallback;
void useRouter;
void useAuthOptional;
void useBootstrapOptional;
