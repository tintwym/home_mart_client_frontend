import { useState } from 'react';
import { Bell, BellRing, Mail, Trash2, TrendingDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useCurrency } from '@/hooks/use-currency';

type PriceAlertSubscriptionProps = {
    listingId: string;
    listingTitle: string;
    currentPrice: number;
    userEmail?: string;
    region?: string | null;
};

type PriceAlertItem = {
    listingId: string;
    listingTitle: string;
    email: string;
    threshold: 'any' | '10' | '20';
    targetPrice: number;
    createdAt: string;
};

export default function PriceAlertSubscription({
    listingId,
    listingTitle,
    currentPrice,
    userEmail = '',
    region,
}: PriceAlertSubscriptionProps) {
    const { toast } = useToast();
    const { formatPrice } = useCurrency();

    // Avoid loading in useEffect - initialize state directly from localStorage
    const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('price_alerts');
                if (stored) {
                    const alerts = JSON.parse(stored) as PriceAlertItem[];
                    return !!alerts.find((a) => a.listingId === listingId);
                }
            } catch (err) {
                console.error('Failed to load initial price alert status', err);
            }
        }
        return false;
    });

    const [email, setEmail] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('price_alerts');
                if (stored) {
                    const alerts = JSON.parse(stored) as PriceAlertItem[];
                    const existing = alerts.find(
                        (a) => a.listingId === listingId,
                    );
                    if (existing) {
                        return existing.email;
                    }
                }
            } catch (err) {
                console.error('Failed to load initial price alert email', err);
            }
        }
        return userEmail;
    });

    const [threshold, setThreshold] = useState<'any' | '10' | '20'>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('price_alerts');
                if (stored) {
                    const alerts = JSON.parse(stored) as PriceAlertItem[];
                    const existing = alerts.find(
                        (a) => a.listingId === listingId,
                    );
                    if (existing) {
                        return existing.threshold;
                    }
                }
            } catch (err) {
                console.error(
                    'Failed to load initial price alert threshold',
                    err,
                );
            }
        }
        return 'any';
    });

    const [showForm, setShowForm] = useState(false);

    // Sync userEmail prop changes directly during render (React-recommended pattern)
    const [prevUserEmail, setPrevUserEmail] = useState(userEmail);
    if (userEmail !== prevUserEmail) {
        setPrevUserEmail(userEmail);
        if (userEmail && !email) {
            setEmail(userEmail);
        }
    }

    const targetPrice = (() => {
        if (threshold === '10') return currentPrice * 0.9;
        if (threshold === '20') return currentPrice * 0.8;
        return currentPrice;
    })();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            toast({
                title: 'Invalid Email',
                description:
                    'Please provide a valid email address to receive alerts.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const stored = localStorage.getItem('price_alerts');
            const alerts = stored
                ? (JSON.parse(stored) as PriceAlertItem[])
                : [];

            // Remove any existing for this listing first
            const filtered = alerts.filter((a) => a.listingId !== listingId);

            const newAlert: PriceAlertItem = {
                listingId,
                listingTitle,
                email: email.trim(),
                threshold,
                targetPrice,
                createdAt: new Date().toISOString(),
            };

            filtered.push(newAlert);
            localStorage.setItem('price_alerts', JSON.stringify(filtered));

            setIsSubscribed(true);
            setShowForm(false);

            toast({
                title: 'Price Alert Set!',
                description: `We will notify ${email.trim()} if the price drops below ${formatPrice(targetPrice, region)}.`,
                variant: 'success',
            });
        } catch {
            toast({
                title: 'Error Saving Alert',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnsubscribe = () => {
        try {
            const stored = localStorage.getItem('price_alerts');
            if (stored) {
                const alerts = JSON.parse(stored) as PriceAlertItem[];
                const filtered = alerts.filter(
                    (a) => a.listingId !== listingId,
                );
                localStorage.setItem('price_alerts', JSON.stringify(filtered));
            }
            setIsSubscribed(false);

            toast({
                title: 'Alert Removed',
                description:
                    'You will no longer receive price drop notifications for this item.',
                variant: 'default',
            });
        } catch (err) {
            console.error('Failed to unsubscribe', err);
        }
    };

    return (
        <div className="mt-4 rounded-xl border border-border/80 bg-slate-50/50 p-4 text-foreground transition-all dark:border-border/30 dark:bg-slate-900/40">
            {!isSubscribed ? (
                <div>
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border/50 bg-slate-100 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            <Bell className="size-4 shrink-0 text-primary" />
                            Notify me of price drops
                        </button>
                    ) : (
                        <form
                            onSubmit={handleSubscribe}
                            className="space-y-3.5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    <TrendingDown className="size-3.5 text-emerald-500" />
                                    Configure Price Alert
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Drop threshold selector */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setThreshold('any')}
                                    className={`cursor-pointer rounded-lg border py-1.5 text-xs font-medium transition-all ${
                                        threshold === 'any'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border/80 bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    Any Drop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setThreshold('10')}
                                    className={`cursor-pointer rounded-lg border py-1.5 text-xs font-medium transition-all ${
                                        threshold === '10'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border/80 bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    -10% Drop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setThreshold('20')}
                                    className={`cursor-pointer rounded-lg border py-1.5 text-xs font-medium transition-all ${
                                        threshold === '20'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border/80 bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    -20% Drop
                                </button>
                            </div>

                            <p className="text-xs font-semibold text-muted-foreground">
                                Alert Target:{' '}
                                <span className="font-bold text-foreground">
                                    {formatPrice(targetPrice, region)}
                                </span>
                            </p>

                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 size-4 shrink-0 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full rounded-lg border border-input bg-background py-2.5 pr-24 pl-9 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 cursor-pointer rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
                                >
                                    Set Alert
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <BellRing className="size-4 animate-bounce" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">
                                Subscribed to drops
                            </p>
                            <p className="truncate text-[10px] font-semibold text-muted-foreground">
                                Alerting {email} below{' '}
                                {formatPrice(targetPrice, region)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleUnsubscribe}
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Remove alert"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
