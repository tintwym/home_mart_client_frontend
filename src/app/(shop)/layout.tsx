'use client';

import { ShopHeader } from '@/components/shop-header';
import Link from 'next/link';

export default function ShopLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col">
            <ShopHeader />
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
