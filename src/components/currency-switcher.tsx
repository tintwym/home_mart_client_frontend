'use client';

import { useBootstrap, useSharedProps } from '@/lib/bootstrap';
import { Coins, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SharedData } from '@/types';
import { useLocalization } from './localization-provider';
import { saveShopCurrency } from '@/lib/shop-prefs';

const CURRENCIES = [
    { code: 'USD', labelKey: 'currency.usd', symbol: '$' },
    { code: 'SGD', labelKey: 'currency.sgd', symbol: 'S$' },
    { code: 'MMK', labelKey: 'currency.mmk', symbol: 'Ks' },
    { code: 'VND', labelKey: 'currency.vnd', symbol: '₫' },
];

export function CurrencySwitcher() {
    const props = useSharedProps();
    const { refresh } = useBootstrap();
    const { t } = useLocalization();
    const currentCurrency = props.currency || { code: 'USD', symbol: '$' };

    const handleSelectCurrency = (code: string) => {
        saveShopCurrency(code);
        void refresh({ currency: code });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-9 shrink-0 gap-1.5 rounded-lg border border-border/40 px-2.5 text-sm font-medium hover:bg-accent"
                    aria-label={t('currency.select')}
                    id="currency-switcher-trigger"
                >
                    <Coins className="size-4 opacity-80" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {currentCurrency.code} ({currentCurrency.symbol})
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 p-1"
                id="currency-switcher-dropdown"
            >
                <div className="mb-1.5 border-b border-border/40 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t('currency.display')}
                </div>
                {CURRENCIES.map(({ code, labelKey, symbol }) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => handleSelectCurrency(code)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${currentCurrency.code === code ? 'bg-accent font-medium text-accent-foreground' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="font-mono text-xs text-primary">
                                {symbol}
                            </span>
                            <span>{t(labelKey)}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                ({code})
                            </span>
                        </span>
                        {currentCurrency.code === code && (
                            <Check className="size-3.5 shrink-0 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
