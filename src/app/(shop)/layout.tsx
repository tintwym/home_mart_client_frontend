'use client';

import { MobileBottomTabBar } from '@/components/mobile-bottom-tab-bar';
import { ShopHeader } from '@/components/shop-header';
import { AuthModalLayout } from '@/components/auth-modal-layout';
import { LocalizationProvider } from '@/components/localization-provider';
import { isAuthOverlayPath } from '@/lib/auth-overlay-paths';
import { useBootstrap } from '@/lib/bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function BootstrapErrorBanner() {
    const { error } = useBootstrap();
    if (!error) return null;
    return (
        <div
            className="border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-sm font-medium text-destructive"
            role="alert"
        >
            {error}
        </div>
    );
}

function ShopMobileFooter() {
    return (
        <div className="border-t border-border/50 px-4 py-4 text-center text-xs text-muted-foreground lg:hidden">
            <Link
                href="/download"
                className="font-medium transition-colors hover:text-primary"
            >
                Get the app
            </Link>
            <span className="mx-2 text-border">·</span>
            <Link
                href="/upgrades"
                className="font-medium transition-colors hover:text-primary"
            >
                Upgrades
            </Link>
        </div>
    );
}

export default function ShopLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    const pathname = usePathname();
    const authOverlayOpen = isAuthOverlayPath(pathname);
    const interceptedAuthModal = authOverlayOpen && modal != null;

    const mainContent =
        authOverlayOpen && !interceptedAuthModal ? null : children;

    const overlayContent = authOverlayOpen ? (modal ?? children) : modal;

    return (
        <LocalizationProvider>
            <div className="flex min-h-dvh flex-col">
                <BootstrapErrorBanner />
                <ShopHeader />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:pb-6">
                    {mainContent}
                </main>
                <ShopMobileFooter />
                <MobileBottomTabBar />
                {authOverlayOpen && overlayContent ? (
                    <AuthModalLayout key={pathname}>
                        {overlayContent}
                    </AuthModalLayout>
                ) : null}
                <footer className="hidden border-t border-border/60 py-8 text-center text-sm text-muted-foreground lg:block">
                    <Link
                        href="/download"
                        className="font-medium transition-colors hover:text-primary"
                    >
                        Get the app
                    </Link>
                    <span className="mx-2">·</span>
                    <Link
                        href="/upgrades"
                        className="font-medium transition-colors hover:text-primary"
                    >
                        Upgrades
                    </Link>
                </footer>
            </div>
        </LocalizationProvider>
    );
}
