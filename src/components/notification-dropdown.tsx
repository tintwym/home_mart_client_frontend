'use client';

import { Link } from '@/lib/app-client';
import { apiFetch } from '@/lib/api';
import { useSharedProps } from '@/lib/bootstrap';
import { Bell, Heart, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Notification = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    created_at: string;
};

function NotificationDropdownContent() {
    const { auth } = useSharedProps();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!auth?.user) return;
        void apiFetch<Notification[]>('/api/notifications')
            .then((rows) => setNotifications(Array.isArray(rows) ? rows : []))
            .catch(() => setNotifications([]));
    }, [auth?.user]);

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        void apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(
            () => undefined,
        );
    };

    const markAllAsRead = () => {
        setNotifications([]);
        void apiFetch('/api/notifications/read-all', { method: 'POST' }).catch(
            () => undefined,
        );
    };

    const getHref = (n: Notification) => {
        if (n.type === 'new_message' && n.data.conversation_id) {
            return `/inbox/${n.data.conversation_id}`;
        }
        if (n.type === 'new_favorite' && n.data.listing_id) {
            return `/listings/${n.data.listing_id}`;
        }
        return '#';
    };

    const getIcon = (type: string) => {
        if (type === 'new_message') {
            return <MessageCircle className="size-4 shrink-0" />;
        }
        if (type === 'new_favorite') {
            return <Heart className="size-4 shrink-0" />;
        }
        return <Bell className="size-4 shrink-0" />;
    };

    const getMessage = (n: Notification) => {
        if (n.type === 'new_message') {
            return `${n.data.from_user_name ?? 'Someone'} sent you a message`;
        }
        if (n.type === 'new_favorite') {
            return `${n.data.favorited_by_name ?? 'Someone'} favorited "${n.data.listing_title ?? 'your listing'}"`;
        }
        return 'New notification';
    };

    return (
        <div className="p-2">
            <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                {notifications.length > 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllAsRead}
                    >
                        Mark all read
                    </Button>
                ) : null}
            </div>
            {notifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    No new notifications
                </p>
            ) : (
                <ul className="space-y-1">
                    {notifications.map((n) => (
                        <li key={n.id}>
                            <Link
                                href={getHref(n)}
                                onClick={() => markAsRead(n.id)}
                                className="flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                            >
                                {getIcon(n.type)}
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">
                                        {getMessage(n)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            n.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function NotificationDropdown() {
    const { auth } = useSharedProps();
    const [open, setOpen] = useState(false);

    if (!auth?.user) return null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <NotificationDropdownContent />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { NotificationDropdownContent };
