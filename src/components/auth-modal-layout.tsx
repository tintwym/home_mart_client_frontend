'use client';

import Link from 'next/link';

/** Glass overlay on top of the shop shell — auth feels like a dialog, not a separate page. */
export function AuthModalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex items-center justify-center sm:top-16">
            <Link
                href="/"
                className="absolute inset-0 bg-background/40 backdrop-blur-md"
                aria-label="Close"
            />
            <div className="relative z-10 w-full max-w-md px-4 py-6 animate-in fade-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
}
