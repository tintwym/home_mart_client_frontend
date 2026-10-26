'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLogoIcon from '@/components/app-logo-icon';
import { SiteSearchBar } from '@/components/site-search-bar';
import { RegionSwitcher } from '@/components/region-switcher';
import { CurrencySwitcher } from '@/components/currency-switcher';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { useSharedProps } from '@/lib/bootstrap';
import { useCart } from '@/hooks/use-cart';
import { useInitials } from '@/hooks/use-initials';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Heart,
    ShoppingBag,
    MessageSquare,
    Plus,
    LogIn,
} from 'lucide-react';
import type { User } from '@/types';

function ShopHeaderInner() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const { user, loading } = useAuth();
    const { t } = useTranslations();
    const getInitials = useInitials();
    const shared = useSharedProps();
    const { count: cartHookCount } = useCart();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const cartCount = user
        ? cartHookCount
        : (shared.auth.cartCount ?? shared.auth.cartListingIds?.length ?? 0);
    const unread = shared.auth.chatUnreadCount ?? 0;
    const appName = shared.name || 'Home Mart';

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-[var(--header-tint)] shadow-[0_1px_0_0_oklch(0.66_0.115_175_/_0.06)] backdrop-blur-xl">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
                <div className="flex h-12 items-center gap-2 sm:h-14 lg:h-16">
                    <Link
                        href="/"
                        className="flex min-w-0 shrink-0 items-center gap-2 text-foreground"
                    >
                        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/15 sm:size-9">
                            <AppLogoIcon className="size-full" />
                        </span>
                        <span className="font-display truncate text-base font-semibold tracking-tight sm:text-lg">
                            {appName}
                        </span>
                    </Link>

                    <SiteSearchBar
                        defaultQuery={searchQuery}
                        compact
                        className="mx-3 hidden min-w-0 flex-1 lg:block"
                    />

                    <nav className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                        <div className="flex items-center gap-0.5 lg:hidden">
                            <RegionSwitcher />
                            <CurrencySwitcher compact />
                        </div>

                        <div className="hidden items-center gap-1 lg:flex">
                            <RegionSwitcher />
                            <CurrencySwitcher />
                            {user ? <NotificationDropdown /> : null}
                            <Button
                                size="sm"
                                className="ml-1 shadow-sm"
                                asChild
                            >
                                <Link href="/listings/create">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Sell
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/favorites" aria-label="Favorites">
                                    <Heart className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative hidden lg:inline-flex"
                            aria-label="Cart"
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent('open-cart-drawer'),
                                );
                            }}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {cartCount > 0 ? (
                                <span className="count-badge">
                                    {cartCount}
                                </span>
                            ) : null}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative lg:hidden"
                            asChild
                        >
                            <Link href="/inbox" aria-label="Inbox">
                                <MessageSquare className="h-5 w-5" />
                                {unread > 0 ? (
                                    <span className="count-badge">
                                        {unread > 99 ? '99+' : unread}
                                    </span>
                                ) : null}
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative hidden lg:inline-flex"
                            asChild
                        >
                            <Link href="/inbox" aria-label="Inbox">
                                <MessageSquare className="h-5 w-5" />
                                {unread > 0 ? (
                                    <span className="count-badge">
                                        {unread > 99 ? '99+' : unread}
                                    </span>
                                ) : null}
                            </Link>
                        </Button>

                        {!loading && user ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="ml-0.5 hidden size-9 rounded-full p-0.5 lg:inline-flex"
                                            aria-label={t('nav.user_menu')}
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={user.avatar ?? undefined}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                        sideOffset={8}
                                    >
                                        <UserMenuContent
                                            user={user as User}
                                            onOpenLogout={() =>
                                                setLogoutOpen(true)
                                            }
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <LogoutConfirmDialog
                                    open={logoutOpen}
                                    onOpenChange={setLogoutOpen}
                                />
                            </>
                        ) : null}

                        {!loading && !user ? (
                            <Button
                                size="sm"
                                className="hidden lg:inline-flex"
                                asChild
                            >
                                <Link href={loginHref('/')}>
                                    <LogIn className="mr-1.5 h-4 w-4" />
                                    Log in
                                </Link>
                            </Button>
                        ) : null}
                    </nav>
                </div>

                <div className="pb-2.5 lg:hidden">
                    <SiteSearchBar defaultQuery={searchQuery} compact />
                </div>
            </div>
        </header>
    );
}

export function ShopHeader() {
    return (
        <Suspense
            fallback={
                <header className="sticky top-0 z-40 border-b border-border/50 bg-[var(--header-tint)] backdrop-blur-xl">
                    <div className="min-h-[7.25rem] w-full px-4 sm:px-6 lg:min-h-16 lg:px-8 xl:px-10" />
                </header>
            }
        >
            <ShopHeaderInner />
        </Suspense>
    );
}
