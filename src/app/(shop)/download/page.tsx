'use client';

import { PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function DownloadPage() {
    return (
        <div className="mx-auto max-w-lg text-center">
            <PageHeader
                title="Get the Home Mart app"
                description="Shop on the go with our mobile apps."
            />
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                    <a
                        href="https://play.google.com/store"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google Play
                    </a>
                </Button>
                <Button variant="outline" asChild>
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
