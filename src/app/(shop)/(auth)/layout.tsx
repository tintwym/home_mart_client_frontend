'use client';

import { AuthModalLayout } from '@/components/auth-modal-layout';

function AuthPageBackdrop() {
    return (
        <div
            className="pointer-events-none select-none opacity-70"
            aria-hidden
        >
            <section className="mb-8 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/15 px-6 py-10 sm:px-10">
                <div className="h-4 w-24 rounded bg-primary/25" />
                <div className="mt-3 h-9 w-64 max-w-full rounded bg-foreground/10" />
                <div className="mt-3 h-4 w-80 max-w-full rounded bg-muted-foreground/15" />
            </section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="aspect-square rounded-lg bg-muted/70"
                    />
                ))}
            </div>
        </div>
    );
}

/** Full-page auth visit: faint store preview under the glass dialog. */
export default function AuthShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AuthPageBackdrop />
            <AuthModalLayout>{children}</AuthModalLayout>
        </>
    );
}
