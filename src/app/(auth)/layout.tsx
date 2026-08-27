'use client';

import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart';

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
            <Link
                href="/"
                className="mb-8 text-2xl font-semibold tracking-tight text-foreground"
            >
                {appName}
            </Link>
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
