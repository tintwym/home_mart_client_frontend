'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/** Full-viewport glass overlay — dims navbar, content, and footer together. */
export function AuthModalLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <Link
                href="/"
                className="absolute inset-0 bg-background/55 backdrop-blur-md"
                aria-label="Close"
            />
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
}
