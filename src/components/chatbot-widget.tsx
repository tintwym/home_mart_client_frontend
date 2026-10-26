'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import {
    askAssistant,
    type AssistantHistoryTurn,
    ApiError,
} from '@/lib/api';
import { isAuthOverlayPath } from '@/lib/auth-overlay-paths';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'user' | 'bot';
    text: string;
    at: Date;
};

function textMatchesPhrase(haystack: string, phrase: string): boolean {
    const p = phrase.trim().toLowerCase();
    if (p.length === 0) return false;
    if (p.length <= 3) {
        const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
    }
    return haystack.includes(p);
}

/** Offline / error fallback when Gemini is unavailable. */
const BOT_RULES: { phrases: string[]; replyKey: string }[] = [
    {
        phrases: [
            'need help',
            'help me',
            'can you help',
            'please help',
            'having trouble',
            'stuck',
        ],
        replyKey: 'chatbot.help_seek_reply',
    },
    {
        phrases: ['contact', 'email', 'reach you'],
        replyKey: 'chatbot.contact_reply',
    },
    {
        phrases: ['price', 'cost', 'how much', 'fee'],
        replyKey: 'chatbot.price_reply',
    },
    {
        phrases: ['support', 'customer service'],
        replyKey: 'chatbot.support_reply',
    },
    { phrases: ['hello', 'hey', 'hi'], replyKey: 'chatbot.greeting_reply' },
    {
        phrases: ['browse', 'shopping', 'how do i buy', 'add to cart'],
        replyKey: 'chatbot.how_to_reply',
    },
];

function fallbackReply(
    userText: string,
    t: (key: string) => string,
): string {
    const lower = userText.trim().toLowerCase();
    if (!lower) return t('chatbot.default_reply');
    for (const rule of BOT_RULES) {
        if (rule.phrases.some((p) => textMatchesPhrase(lower, p))) {
            return t(rule.replyKey);
        }
    }
    if (/\bhelp\b/.test(lower)) return t('chatbot.help_seek_reply');
    return t('chatbot.default_reply');
}

function toHistory(messages: Message[]): AssistantHistoryTurn[] {
    return messages
        .filter((m) => m.id !== 'welcome')
        .slice(-12)
        .map((m) => ({
            role: m.role === 'user' ? ('user' as const) : ('model' as const),
            text: m.text,
        }));
}

export function ChatbotWidget() {
    const { t } = useTranslations();
    const pathname = usePathname() || '/';
    const hide =
        pathname.startsWith('/checkout') || isAuthOverlayPath(pathname);
    const showAboveTabBar =
        !pathname.startsWith('/checkout') && !pathname.startsWith('/settings');

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: 'welcome',
            role: 'bot',
            text: t('chatbot.welcome'),
            at: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }, [messages, open]);

    if (hide) return null;

    const send = async () => {
        const text = input.trim();
        if (!text || busy) return;
        setInput('');
        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            text,
            at: new Date(),
        };
        const prior = [...messages, userMsg];
        setMessages(prior);
        setBusy(true);
        try {
            const reply = await askAssistant(text, toHistory(messages));
            setMessages((prev) => [
                ...prev,
                {
                    id: `b-${Date.now()}`,
                    role: 'bot',
                    text: reply,
                    at: new Date(),
                },
            ]);
        } catch (err) {
            const offlineHint =
                err instanceof ApiError &&
                (err.status === 503 || err.status === 429 || err.status >= 500)
                    ? err.message
                    : null;
            setMessages((prev) => [
                ...prev,
                {
                    id: `b-${Date.now()}`,
                    role: 'bot',
                    text:
                        offlineHint ||
                        fallbackReply(text, t),
                    at: new Date(),
                },
            ]);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button
                type="button"
                aria-label={t('chatbot.open_label')}
                onClick={() => setOpen(true)}
                className={cn(
                    'fixed z-50 flex size-12 min-h-12 min-w-12 touch-manipulation items-center justify-center rounded-full',
                    'bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                    'right-[max(1.5rem,env(safe-area-inset-right))]',
                    showAboveTabBar
                        ? 'bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] lg:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]'
                        : 'bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]',
                )}
            >
                <MessageCircle className="size-5" />
            </button>

            {open ? (
                <div
                    className={cn(
                        'fixed inset-0 z-50 flex flex-col bg-background md:inset-auto md:h-[420px] md:w-[380px] md:rounded-2xl md:border md:shadow-xl',
                        'md:right-[max(1.5rem,env(safe-area-inset-right))]',
                        showAboveTabBar
                            ? 'md:bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] lg:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]'
                            : 'md:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]',
                    )}
                    aria-label={t('chatbot.panel_label')}
                >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <span className="font-semibold">
                            {t('chatbot.title')}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('chatbot.close_label')}
                            onClick={() => setOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                    </div>
                    <div
                        ref={listRef}
                        className="flex-1 space-y-3 overflow-y-auto p-4"
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    'flex',
                                    m.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
                                        m.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {busy ? (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                                    …
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <form
                        className="flex gap-2 border-t p-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void send();
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chatbot.placeholder')}
                            disabled={busy}
                            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                            aria-label={t('chatbot.input_label')}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={busy || !input.trim()}
                            aria-label={t('chatbot.send_label')}
                        >
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            ) : null}
        </>
    );
}
