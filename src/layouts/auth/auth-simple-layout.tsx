import { Link } from '@/lib/app-client';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { paths } from '@/lib/paths';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-10">
            {/* Mock Blurred Homepage/Dashboard Background underneath the glass overlay */}
            <div className="pointer-events-none absolute inset-0 -z-30 flex scale-105 flex-col overflow-hidden opacity-40 blur-md select-none dark:opacity-20">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b border-border/10 px-8 py-4">
                    <div className="h-6 w-24 rounded bg-muted-foreground/30" />
                    <div className="h-9 w-64 rounded bg-muted-foreground/20" />
                    <div className="flex gap-4">
                        <div className="h-6 w-16 rounded bg-muted-foreground/30" />
                        <div className="h-6 w-16 rounded bg-muted-foreground/30" />
                    </div>
                </div>
                {/* Mock Hero Banner */}
                <div className="m-8 h-48 rounded-2xl bg-linear-to-r from-primary/35 via-secondary/40 to-accent/35" />
                {/* Mock Grid of Listing Cards */}
                <div className="grid grid-cols-2 gap-6 px-8 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-3 rounded-xl border border-border/10 bg-muted/20 p-4"
                        >
                            <div className="aspect-square w-full rounded bg-muted-foreground/20" />
                            <div className="h-4 w-3/4 rounded bg-muted-foreground/30" />
                            <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden select-none">
                <div className="absolute top-[-10%] left-[-10%] h-1/2 w-1/2 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15" />
                <div className="absolute top-1/5 right-[-5%] h-2/5 w-2/5 rounded-full bg-secondary/35 blur-3xl dark:bg-secondary/20" />
                <div className="absolute right-[-10%] bottom-[-10%] h-1/2 w-1/2 rounded-full bg-accent/30 blur-3xl dark:bg-accent/15" />
            </div>

            {/* Transparent backdrop close area (clicking outside the modal navigates back to dashboard) */}
            <Link
                href={paths.home}
                className="absolute inset-0 -z-10 cursor-default"
                aria-hidden="true"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-105 rounded-2xl border border-primary/20 bg-card/92 p-6 text-foreground shadow-xl backdrop-blur-md sm:p-8 md:p-10 dark:border-primary/25 dark:bg-card/95"
            >
                {/* Close Button */}
                <Link
                    href={paths.home}
                    aria-label="Close"
                    className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all duration-300 hover:rotate-90 hover:bg-accent hover:text-foreground"
                >
                    <X className="size-4" />
                </Link>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href={paths.home}
                            className="flex flex-col items-center gap-1.5 font-medium transition-transform hover:scale-105"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                                <AppLogoIcon className="size-7 fill-current text-primary" />
                            </div>
                        </Link>

                        <div className="space-y-1 text-center">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                            {description && (
                                <p className="mx-auto max-w-70 text-center text-xs leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
