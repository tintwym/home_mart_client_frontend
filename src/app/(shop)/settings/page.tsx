'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/auth-redirect';
import { PageHeader, PageLoading } from '@/components/page-kit';
import {
    User,
    Lock,
    CreditCard,
    Package,
    Shield,
    ChevronRight,
    Sparkles,
    Smartphone,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
    { href: '/settings/profile', label: 'Profile', icon: User, desc: 'Name, avatar, region' },
    { href: '/settings/password', label: 'Password', icon: Lock, desc: 'Update sign-in password' },
    { href: '/settings/payment', label: 'Payment methods', icon: CreditCard, desc: 'Cards and local wallets' },
    { href: '/settings/orders', label: 'Orders', icon: Package, desc: 'Purchases and sales history' },
    { href: '/settings/two-factor', label: 'Two-factor auth', icon: Shield, desc: 'Extra account security' },
    { href: '/upgrades', label: 'Seller upgrades', icon: Sparkles, desc: 'Listing slots and boosts' },
    { href: '/download', label: 'Get the app', icon: Smartphone, desc: 'iOS and Android download' },
];

export default function SettingsPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace(loginHref('/settings'));
    }, [loading, user, router]);

    if (loading) return <PageLoading label="Loading settings…" />;
    if (!user) return <PageLoading label="Redirecting…" />;

    const initial = (user.name?.trim() || user.email || '?').charAt(0).toUpperCase();

    return (
        <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-secondary/10 p-5 shadow-xs">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
                    {initial}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                    </p>
                </div>
            </div>

            <PageHeader as="h2" title="Settings" />

            <ul className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
                {links.map(({ href, label, icon: Icon, desc }, index) => (
                    <li
                        key={href}
                        className={cn(index > 0 && 'border-t border-border/60')}
                    >
                        <Link
                            href={href}
                            className="flex items-center gap-3 p-4 transition-all duration-200 hover:bg-muted/40 active:scale-[0.995]"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                                <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-medium">{label}</span>
                                <span className="block text-xs text-muted-foreground">
                                    {desc}
                                </span>
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/25 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                onClick={async () => {
                    await logout();
                    router.push(loginHref('/settings'));
                }}
            >
                <LogOut className="size-4" />
                Log out
            </button>
        </div>
    );
}
