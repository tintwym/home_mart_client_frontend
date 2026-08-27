'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BackLink, PageHeader } from '@/components/page-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TwoFactorSettingsPage() {
    const { user, loading, refresh } = useAuth();
    const router = useRouter();
    const [qr, setQr] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [recovery, setRecovery] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const enabled = Boolean(user?.two_factor_enabled);

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    if (!user) return null;

    return (
        <div className="mx-auto max-w-lg">
            <BackLink href="/settings" label="Settings" />
            <PageHeader
                title="Two-factor authentication"
                description={
                    enabled
                        ? '2FA is enabled on your account.'
                        : 'Add an authenticator app for extra security.'
                }
            />
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            {message ? <p className="mb-3 text-sm text-primary">{message}</p> : null}

            {!enabled ? (
                <div className="space-y-4">
                    <Button
                        onClick={async () => {
                            setError(null);
                            try {
                                await apiFetch(
                                    '/api/user/two-factor-authentication',
                                    { method: 'POST', body: {} },
                                );
                                const qrRes = await apiFetch<{
                                    svg?: string;
                                    url?: string;
                                }>('/api/user/two-factor-qr-code');
                                setQr(qrRes.svg || qrRes.url || null);
                                setMessage('Scan the QR code, then confirm.');
                            } catch (e) {
                                setError(
                                    e instanceof Error
                                        ? e.message
                                        : 'Failed to enable',
                                );
                            }
                        }}
                    >
                        Enable 2FA
                    </Button>
                    {qr ? (
                        <div className="space-y-3">
                            {qr.startsWith('<') ? (
                                <div
                                    className="rounded-md border border-border bg-white p-4"
                                    dangerouslySetInnerHTML={{ __html: qr }}
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={qr} alt="2FA QR" className="max-w-xs" />
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="code">Confirmation code</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={async () => {
                                    try {
                                        await apiFetch(
                                            '/api/user/confirmed-two-factor-authentication',
                                            {
                                                method: 'POST',
                                                body: { code },
                                            },
                                        );
                                        const codes = await apiFetch<{
                                            recovery_codes?: string[];
                                        }>(
                                            '/api/user/two-factor-recovery-codes',
                                        );
                                        setRecovery(codes.recovery_codes ?? []);
                                        await refresh();
                                        setMessage('2FA confirmed');
                                    } catch (e) {
                                        setError(
                                            e instanceof Error
                                                ? e.message
                                                : 'Confirm failed',
                                        );
                                    }
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="space-y-3">
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            try {
                                await apiFetch(
                                    '/api/user/two-factor-authentication',
                                    { method: 'DELETE' },
                                );
                                await refresh();
                                setMessage('2FA disabled');
                            } catch (e) {
                                setError(
                                    e instanceof Error
                                        ? e.message
                                        : 'Disable failed',
                                );
                            }
                        }}
                    >
                        Disable 2FA
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                const codes = await apiFetch<{
                                    recovery_codes?: string[];
                                }>('/api/user/two-factor-recovery-codes');
                                setRecovery(codes.recovery_codes ?? []);
                            } catch (e) {
                                setError(
                                    e instanceof Error
                                        ? e.message
                                        : 'Failed',
                                );
                            }
                        }}
                    >
                        Show recovery codes
                    </Button>
                </div>
            )}

            {recovery.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-2 rounded-md border border-border p-3 font-mono text-xs">
                    {recovery.map((c) => (
                        <li key={c}>{c}</li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
