'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getConversationMessages } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
    id: string;
    body?: string;
    user_id?: string;
    sender_id?: string;
    created_at?: string;
};

export default function InboxThreadPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getConversationMessages(id);
            const rows = Array.isArray(res)
                ? res
                : ((res as { data?: Message[]; messages?: Message[] }).data ??
                  (res as { messages?: Message[] }).messages ??
                  []);
            setMessages(rows as Message[]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load messages');
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
    }, [authLoading, user, router, id]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setSending(true);
        try {
            await apiFetch(`/api/conversations/${id}/messages`, {
                method: 'POST',
                body: { body: body.trim() },
            });
            setBody('');
            await load();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Send failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-2xl flex-col">
            <BackLink href="/inbox" label="Inbox" />
            <PageHeader title="Conversation" />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : (
                <>
                    <div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4">
                        {messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No messages yet. Say hello!
                            </p>
                        ) : (
                            messages.map((m) => {
                                const mine =
                                    (m.user_id || m.sender_id) === user?.id;
                                return (
                                    <div
                                        key={m.id}
                                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                            mine
                                                ? 'ml-auto bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {m.body}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <form onSubmit={send} className="flex gap-2">
                        <Input
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type a message…"
                        />
                        <Button type="submit" disabled={sending}>
                            Send
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
}
