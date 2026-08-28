'use client';

import { ShopHeader } from '@/components/shop-header';
import { AuthModalLayout } from '@/components/auth-modal-layout';
import { isAuthOverlayPath } from '@/lib/auth-overlay-paths';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

    // Intercepted auth: keep the underlying page in main; overlay shows the modal slot.
    // Direct /login visit: hide main duplicate and show auth only in the overlay.
    const mainContent =
        authOverlayOpen && !interceptedAuthModal ? null : children;

    const overlayContent = authOverlayOpen ? (modal ?? children) : modal;

    return (
        <div className="flex min-h-dvh flex-col">
            <ShopHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
                {mainContent}
            </main>
            {authOverlayOpen && overlayContent ? (
                <AuthModalLayout key={pathname}>{overlayContent}</AuthModalLayout>
            ) : null}
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
