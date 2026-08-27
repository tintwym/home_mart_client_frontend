import type { AppHref } from '@/types/href';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, Key, Package, Shield, User } from 'lucide-react';
import { paths } from '@/lib/paths';
import { useTranslations } from '@/hooks/use-translations';

export type SettingsNavLink = {
    title: string;
    href: AppHref;
    icon: LucideIcon;
};

export function useSettingsNavLinks(): SettingsNavLink[] {
    const { t } = useTranslations();

    return [
        {
            title: t('settings.profile'),
            href: paths.settings.profile,
            icon: User,
        },
        {
            title: t('settings.password'),
            href: paths.settings.password,
            icon: Key,
        },
        {
            title: t('settings.payment'),
            href: paths.settings.payment,
            icon: CreditCard,
        },
        {
            title: t('settings.two_factor'),
            href: paths.settings.twoFactor,
            icon: Shield,
        },
        {
            title: t('settings.orders'),
            href: paths.settings.orders,
            icon: Package,
        },
    ];
}
