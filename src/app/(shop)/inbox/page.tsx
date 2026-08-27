'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getConversations } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';

type Conversation = {
    id: string;
    listing?: { title?: string; id?: string };
    other_user?: { name?: string };
    last_message?: { body?: string };
    updated_at?: string;
};

export default function InboxPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getConversations();
            const rows = Array.isArray(res)
                ? res
                : ((res as { data?: Conversation[]; conversations?: Conversation[] })
                      .data ??
                  (res as { conversations?: Conversation[] }).conversations ??
                  []);
            setItems(rows as Conversation[]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load inbox');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }
        if (user) void load();
    }, [authLoading, user, router]);

    return (
        <div>
            <PageHeader title="Inbox" description="Your conversations" />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                    {items.map((c) => (
                        <li key={c.id}>
                            <Link
                                href={`/inbox/${c.id}`}
                                className="block p-4 hover:bg-muted/40"
                            >
                                <div className="font-medium">
                                    {c.other_user?.name || 'Chat'}
                                    {c.listing?.title
                                        ? ` · ${c.listing.title}`
                                        : ''}
                                </div>
                                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                    {c.last_message?.body || 'No messages yet'}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
