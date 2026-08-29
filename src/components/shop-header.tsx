'use client';

import Link from 'next/link';
import { Suspense, useState, type ReactNode } from 'react';
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Heart,
    ShoppingBag,
    MessageSquare,
    Settings,
    Plus,
    LogIn,
    User,
    Menu,
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
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--header-tint)] backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
                {/* Row 1: brand + primary actions */}
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

                    {/* Desktop / large tablet: inline search */}
                    <SiteSearchBar
                        defaultQuery={searchQuery}
                        compact
                        className="mx-2 hidden min-w-0 flex-1 lg:block"
                    />

                    <nav className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                        {/* Desktop-only utilities */}
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

                        {/* Cart — always visible */}
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

                        {/* Desktop inbox + account */}
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    asChild
                                >
                                    <Link href="/settings" aria-label="Account">
                                        <User className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </>
                        ) : !loading ? (
                            <Button size="icon" className="lg:hidden" asChild>
                                <Link href="/login" aria-label="Log in">
                                    <LogIn className="h-4 w-4" />
                                </Link>
                            </Button>
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

                        {/* Mobile / tablet menu */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </nav>
                </div>

                {/* Row 2: full-width search on mobile & tablet */}
                <div className="pb-2 lg:hidden">
                    <SiteSearchBar defaultQuery={searchQuery} compact />
                </div>
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                    <SheetHeader>
                        <SheetTitle>{appName}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-6 px-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <RegionSwitcher />
                            <CurrencySwitcher compact />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-2 border-b border-border pb-4 text-sm">
                                <User className="size-4 text-muted-foreground" />
                                <span className="font-medium">{user.name}</span>
                                {unread > 0 ? (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                        {unread} unread
                                    </span>
                                ) : null}
                            </div>
                        ) : null}

                        <nav className="flex flex-col gap-1">
                            <MenuLink
                                href="/listings/create"
                                onNavigate={closeMenu}
                            >
                                <Plus className="size-4" />
                                Sell an item
                            </MenuLink>
                            <MenuLink href="/favorites" onNavigate={closeMenu}>
                                <Heart className="size-4" />
                                Favorites
                            </MenuLink>
                            <MenuLink href="/inbox" onNavigate={closeMenu}>
                                <MessageSquare className="size-4" />
                                Inbox
                                {unread > 0 ? (
                                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                        {unread}
                                    </span>
                                ) : null}
                            </MenuLink>
                            {user ? (
                                <>
                                    <MenuLink
                                        href="/settings"
                                        onNavigate={closeMenu}
                                    >
                                        <Settings className="size-4" />
                                        Settings
                                    </MenuLink>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent"
                                        onClick={() => {
                                            closeMenu();
                                            void logout();
                                        }}
                                    >
                                        <LogIn className="size-4" />
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <MenuLink href="/login" onNavigate={closeMenu}>
                                    <LogIn className="size-4" />
                                    Log in
                                </MenuLink>
                            )}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

function MenuLink({
    href,
    children,
    onNavigate,
}: {
    href: string;
    children: ReactNode;
    onNavigate: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
        >
            {children}
        </Link>
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
