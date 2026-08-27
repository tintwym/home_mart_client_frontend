import { useLocalization } from './localization-provider';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const REGIONS: {
    code: string;
    labelKey: string;
    currency: string;
    flag: string;
    locale: string;
}[] = [
    {
        code: 'VN',
        labelKey: 'region.vietnam',
        currency: '₫',
        flag: '🇻🇳',
        locale: 'vi',
    },
    {
        code: 'SG',
        labelKey: 'region.singapore',
        currency: 'S$',
        flag: '🇸🇬',
        locale: 'en',
    },
    {
        code: 'MM',
        labelKey: 'region.myanmar',
        currency: 'MMK',
        flag: '🇲🇲',
        locale: 'my',
    },
    {
        code: 'US',
        labelKey: 'region.united_states',
        currency: '$',
        flag: '🇺🇸',
        locale: 'en',
    },
];

const LOCALES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'my', label: 'မြန်မာဘာသာ', flag: '🇲🇲' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function LocationIndicator() {
    const { region, locale, setRegion, setLocale, t } = useLocalization();

    const currentRegionInfo =
        REGIONS.find((r) => r.code === region) || REGIONS[3];
    const currentLocaleInfo =
        LOCALES.find((l) => l.code === locale) || LOCALES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-9 shrink-0 gap-1.5 rounded-lg border border-border/40 px-2.5 text-sm font-medium hover:bg-accent"
                    aria-label={t('switcher.location_language')}
                    id="location-indicator-trigger"
                >
                    <Globe className="size-4 opacity-80" />
                    <span className="text-base">{currentRegionInfo.flag}</span>
                    <span className="hidden text-xs font-semibold text-muted-foreground sm:inline-block">
                        {currentRegionInfo.code} /{' '}
                        {currentLocaleInfo.code.toUpperCase()}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 p-1.5"
                id="location-indicator-dropdown"
            >
                <div className="mb-1.5 border-b border-border/40 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t('region.select_country_region')}
                </div>
                {REGIONS.map(({ code, labelKey, currency, flag, locale: regionLocale }) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setRegion(code, regionLocale)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${region === code ? 'bg-accent font-medium text-accent-foreground' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-sm">{flag}</span>
                            <span>{t(labelKey)}</span>
                            <span className="text-[10px] text-muted-foreground">
                                ({currency})
                            </span>
                        </span>
                        {region === code && (
                            <Check className="size-3.5 shrink-0 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="my-1.5" />

                <div className="mb-1.5 border-b border-border/40 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t('switcher.select_language')}
                </div>
                {LOCALES.map(({ code, label, flag }) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setLocale(code)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${locale === code ? 'bg-accent font-medium text-accent-foreground' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-sm">{flag}</span>
                            <span>{label}</span>
                        </span>
                        {locale === code && (
                            <Check className="size-3.5 shrink-0 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
