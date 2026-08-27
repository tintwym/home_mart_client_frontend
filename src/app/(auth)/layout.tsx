'use client';

import { AuthTopNav } from '@/components/auth-top-nav';
import AppLogoIcon from '@/components/app-logo-icon';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart';

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <AuthTopNav />
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-10">
                <Link
                    href="/"
                    className="mb-6 flex items-center gap-2.5 text-foreground md:hidden"
                >
                    <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                        <AppLogoIcon className="size-8" />
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        {appName}
                    </span>
                </Link>
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
