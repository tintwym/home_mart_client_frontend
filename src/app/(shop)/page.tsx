import { Suspense } from 'react';
import { PageLoading } from '@/components/page-kit';
import { HomePageContent } from './home-page-content';

export default function HomePage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <HomePageContent />
        </Suspense>
    );
}
