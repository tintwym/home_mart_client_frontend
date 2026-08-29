'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Plus, MessageSquare, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useSharedProps } from '@/lib/bootstrap';

const HIDDEN_PREFIXES = ['/checkout', '/two-factor-challenge'];

function shouldHide(pathname: string | null): boolean {
    if (!pathname) return false;
    return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type TabItem = {
    href: string;
    label: string;
    icon: typeof Home;
    active: boolean;
    badge?: number;
};

export function MobileBottomTabBar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const shared = useSharedProps();
    const unread = shared.auth.chatUnreadCount ?? 0;

    if (shouldHide(pathname)) return null;

    const accountHref = user ? '/settings' : '/login';
    const accountActive = user
        ? pathname.startsWith('/settings')
        : pathname === '/login' || pathname === '/register';

    const leftTabs: TabItem[] = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
            active: pathname === '/',
        },
        {
            href: '/favorites',
            label: 'Saved',
            icon: Heart,
            active: pathname === '/favorites',
        },
    ];

    const rightTabs: TabItem[] = [
        {
            href: '/inbox',
            label: 'Inbox',
            icon: MessageSquare,
            active: pathname.startsWith('/inbox'),
            badge: unread,
        },
        {
            href: accountHref,
            label: user ? 'Account' : 'Log in',
            icon: user ? User : LogIn,
            active: accountActive,
        },
    ];

    const sellActive =
        pathname === '/listings/create' ||
        (pathname.startsWith('/listings/') && pathname.endsWith('/edit'));

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden"
            aria-label="Primary navigation"
        >
            <div
                className="mx-auto flex h-14 max-w-lg items-end justify-around px-2"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {leftTabs.map((tab) => (
                    <TabLink key={tab.href} {...tab} />
                ))}

                <Link
                    href="/listings/create"
                    aria-label="Sell an item"
                    aria-current={sellActive ? 'page' : undefined}
                    className="-mt-3 flex flex-col items-center gap-0.5"
                >
                    <span
                        className={cn(
                            'flex size-12 items-center justify-center rounded-full shadow-md transition-colors',
                            sellActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90',
                        )}
                    >
                        <Plus className="size-6" strokeWidth={2.5} />
                    </span>
                    <span
                        className={cn(
                            'text-[10px] font-medium',
                            sellActive
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    >
                        Sell
                    </span>
                </Link>

                {rightTabs.map((tab) => (
                    <TabLink key={tab.href} {...tab} disabled={loading} />
                ))}
            </div>
        </nav>
    );
}

function TabLink({
    href,
    label,
    icon: Icon,
    active,
    badge,
    disabled,
}: TabItem & { disabled?: boolean }) {
    return (
        <Link
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'relative flex min-w-[3.5rem] flex-1 flex-col items-center justify-end gap-0.5 py-1.5',
                disabled && 'pointer-events-none opacity-50',
            )}
        >
            <span className="relative">
                <Icon
                    className={cn(
                        'size-5',
                        active ? 'text-primary' : 'text-muted-foreground',
                    )}
                    strokeWidth={active ? 2.25 : 2}
                />
                {badge != null && badge > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                        {badge > 99 ? '99+' : badge}
                    </span>
                ) : null}
            </span>
            <span
                className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                )}
            >
                {label}
            </span>
        </Link>
    );
}
