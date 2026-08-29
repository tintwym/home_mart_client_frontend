'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLogoIcon from '@/components/app-logo-icon';
import { SiteSearchBar } from '@/components/site-search-bar';
import { RegionSwitcher } from '@/components/region-switcher';
import { CurrencySwitcher } from '@/components/currency-switcher';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { useAuth } from '@/lib/auth';
import { useSharedProps } from '@/lib/bootstrap';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
    Heart,
    ShoppingBag,
    MessageSquare,
    Settings,
    Plus,
    LogIn,
    User,
} from 'lucide-react';

function ShopHeaderInner() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const { user, logout, loading } = useAuth();
    const shared = useSharedProps();
    const { count: cartHookCount } = useCart();
    const cartCount = user
        ? cartHookCount
        : (shared.auth.cartCount ?? shared.auth.cartListingIds?.length ?? 0);
    const unread = shared.auth.chatUnreadCount ?? 0;
    const appName = shared.name || 'Home Mart';

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--header-tint)] backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
                <div className="flex h-12 items-center gap-2 sm:h-14 lg:h-16">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-2 text-foreground"
                    >
                        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 sm:size-9">
                            <AppLogoIcon className="size-full" />
                        </span>
                        <span className="hidden text-lg font-semibold tracking-tight sm:inline">
                            {appName}
                        </span>
                    </Link>

                    <SiteSearchBar
                        defaultQuery={searchQuery}
                        compact
                        className="mx-2 hidden min-w-0 flex-1 lg:block"
                    />

                    <nav className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                        {/* Mobile / tablet: region + currency */}
                        <div className="flex items-center gap-0.5 lg:hidden">
                            <RegionSwitcher />
                            <CurrencySwitcher compact />
                        </div>

                        {/* Desktop utilities */}
                        <div className="hidden items-center gap-0.5 lg:flex">
                            <RegionSwitcher />
                            <CurrencySwitcher />
                            {user ? <NotificationDropdown /> : null}
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/listings/create" aria-label="Sell">
                                    <Plus className="h-5 w-5" />
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
                            className="relative"
                            asChild
                        >
                            <Link href="/cart" aria-label="Cart">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 ? (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                        {cartCount}
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
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                        {unread}
                                    </span>
                                ) : null}
                            </Link>
                        </Button>

                        {!loading && user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden lg:inline-flex"
                                    asChild
                                >
                                    <Link href="/settings" aria-label="Settings">
                                        <Settings className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden xl:inline-flex"
                                    onClick={() => void logout()}
                                >
                                    <User className="mr-1.5 h-4 w-4" />
                                    {user.name}
                                </Button>
                            </>
                        ) : null}

                        {!loading && !user ? (
                            <Button
                                size="sm"
                                className="hidden lg:inline-flex"
                                asChild
                            >
                                <Link href="/login">
                                    <LogIn className="mr-1.5 h-4 w-4" />
                                    Log in
                                </Link>
                            </Button>
                        ) : null}
                    </nav>
                </div>

                <div className="pb-2 lg:hidden">
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
                <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--header-tint)] backdrop-blur-md">
                    <div className="mx-auto h-12 max-w-7xl sm:h-14 lg:h-16" />
                </header>
            }
        >
            <ShopHeaderInner />
        </Suspense>
    );
}
