'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/page-kit';
import {
    User,
    Lock,
    CreditCard,
    Package,
    Shield,
    ChevronRight,
} from 'lucide-react';

const links = [
    { href: '/settings/profile', label: 'Profile', icon: User },
    { href: '/settings/password', label: 'Password', icon: Lock },
    { href: '/settings/payment', label: 'Payment methods', icon: CreditCard },
    { href: '/settings/orders', label: 'Orders', icon: Package },
    { href: '/settings/two-factor', label: 'Two-factor auth', icon: Shield },
];

export default function SettingsPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    if (!user) return null;

    return (
        <div className="mx-auto max-w-lg">
            <PageHeader
                title="Settings"
                description={`Signed in as ${user.email}`}
            />
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {links.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="flex items-center gap-3 p-4 hover:bg-muted/40"
                        >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 font-medium">{label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="mt-6 w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted/40"
                onClick={async () => {
                    await logout();
                    router.push('/login');
                }}
            >
                Log out
            </button>
        </div>
    );
}
