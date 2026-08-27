import { router } from '@/lib/app-client'
import { useSharedProps } from '@/lib/bootstrap';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SharedData } from '@/types';
import { useLocalization } from './localization-provider';

const REGIONS: {
    code: string;
    labelKey: string;
    currency: string;
    flag: string;
}[] = [
    { code: 'VN', labelKey: 'region.vietnam', currency: '₫', flag: '🇻🇳' },
    { code: 'SG', labelKey: 'region.singapore', currency: 'S$', flag: '🇸🇬' },
    { code: 'MM', labelKey: 'region.myanmar', currency: 'MMK', flag: '🇲🇲' },
    { code: 'US', labelKey: 'region.united_states', currency: '$', flag: '🇺🇸' },
];

export function RegionSwitcher() {
    const props = useSharedProps();
    const { t } = useLocalization();
    const currentRegion = props.region || 'US';

    function setRegion(code: string) {
        router.post('/region', { region: code }, { preserveScroll: true });
    }

    const currentRegionInfo =
        REGIONS.find((r) => r.code === currentRegion) || REGIONS[3];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-9 shrink-0 gap-1.5 px-2.5 text-sm font-medium hover:bg-accent"
                    aria-label={t('region.select')}
                >
                    <Globe className="size-4 opacity-80" />
                    <span>{currentRegionInfo.flag}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline-block">
                        {currentRegionInfo.code}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <div className="mb-1 border-b border-border/40 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t('region.select_country_region')}
                </div>
                {REGIONS.map(({ code, labelKey, currency, flag }) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setRegion(code)}
                        className={`flex cursor-pointer items-center justify-between ${currentRegion === code ? 'bg-accent font-medium' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <span>{flag}</span>
                            <span>{t(labelKey)}</span>
                            <span className="text-xs text-muted-foreground">
                                ({currency})
                            </span>
                        </span>
                        {currentRegion === code && (
                            <Check className="size-3.5 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
