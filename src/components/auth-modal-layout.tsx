'use client';

import { useEffect } from 'react';
import { useCloseAuthModal } from '@/hooks/use-close-auth-modal';

/** Full-viewport glass overlay — dims navbar, content, and footer together. */
export function AuthModalLayout({ children }: { children: React.ReactNode }) {
    const close = useCloseAuthModal();

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [close]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
        >
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-background/55 backdrop-blur-md"
                aria-label="Close dialog"
                onClick={close}
            />
            <div
                className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
