'use client';

import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

export default function DownloadPage() {
    return (
        <div className="mx-auto max-w-lg">
            <section className="shop-hero mb-8 px-6 py-10 text-center sm:px-10">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 top-0 size-36 rounded-full bg-primary/15 blur-3xl"
                />
                <div className="relative">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Smartphone className="size-7" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Get the Home Mart app
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        Shop on the go — browse, message sellers, and checkout
                        from your phone.
                    </p>
                </div>
            </section>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild className="min-w-[10rem] shadow-sm">
                    <a
                        href="https://play.google.com/store"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google Play
                    </a>
                </Button>
                <Button variant="outline" asChild className="min-w-[10rem]">
                    <a
                        href="https://apps.apple.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        App Store
                    </a>
                </Button>
            </div>
        </div>
    );
}
