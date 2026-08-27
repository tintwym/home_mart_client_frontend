'use client';

import Link from 'next/link';
import AppLogoIcon from '@/components/app-logo-icon';
import { useAuth } from '@/lib/auth';
import { useSharedProps } from '@/lib/bootstrap';
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

export default function ShopLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    const { user, logout, loading } = useAuth();
    const shared = useSharedProps();
    const cartCount =
        shared.auth.cartCount ?? shared.auth.cartListingIds?.length ?? 0;
    const unread = shared.auth.chatUnreadCount ?? 0;
    const appName = shared.name || 'Home Mart';

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--header-tint)] backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
                    >
                        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10">
                            <AppLogoIcon className="size-full" />
                        </span>
                        <span className="truncate">{appName}</span>
                    </Link>
                    <nav className="ml-auto flex items-center gap-1 sm:gap-2">
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
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="/cart" aria-label="Cart">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 ? (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                        {cartCount}
                                    </span>
                                ) : null}
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="relative" asChild>
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
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/settings" aria-label="Settings">
                                        <Settings className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                    onClick={() => void logout()}
                                >
                                    <User className="mr-1.5 h-4 w-4" />
                                    {user.name}
                                </Button>
                            </>
                        ) : !loading ? (
                            <Button size="sm" asChild>
                                <Link href="/login">
                                    <LogIn className="mr-1.5 h-4 w-4" />
                                    Log in
                                </Link>
                            </Button>
                        ) : null}
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
                {children}
            </main>
            {modal}
            <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
                <Link href="/download" className="hover:text-foreground">
                    Get the app
                </Link>
                <span className="mx-2">·</span>
                <Link href="/upgrades" className="hover:text-foreground">
                    Upgrades
                </Link>
            </footer>
        </div>
    );
}
