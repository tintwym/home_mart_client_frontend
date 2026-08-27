'use client';

import { useParams } from 'next/navigation';
import { ListingDetailView } from '@/components/listing-detail-view';

export default function ListingShowPage() {
    const { id } = useParams<{ id: string }>();
    return <ListingDetailView id={id} />;
}
