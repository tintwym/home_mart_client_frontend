'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getUpgrades } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageError, PageHeader, PageLoading } from '@/components/page-kit';
import { Button } from '@/components/ui/button';

export default function UpgradesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUpgrades();
            setData(res as Record<string, unknown>);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load upgrades');
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
        <div className="mx-auto max-w-lg">
            <PageHeader
                title="Upgrades"
                description="Buy more listing slots and promotions."
            />
            {loading || authLoading ? (
                <PageLoading />
            ) : error ? (
                <PageError message={error} onRetry={() => void load()} />
            ) : (
                <div className="space-y-4">
                    <pre className="overflow-auto rounded-xl border border-border bg-card p-4 text-xs">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                    <Button
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                await apiFetch('/api/upgrades/slots', {
                                    method: 'POST',
                                    body: {},
                                });
                                await load();
                            } catch (e) {
                                alert(
                                    e instanceof Error ? e.message : 'Failed',
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        Purchase listing slots
                    </Button>
                </div>
            )}
        </div>
    );
}
