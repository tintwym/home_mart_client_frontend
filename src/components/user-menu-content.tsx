import { Link } from '@/lib/app-client';
import { LogOut, Package, Settings, UserRound } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { paths } from '@/lib/paths';
import type { User } from '@/types';

type Props = {
    user: User;
    onOpenLogout: () => void;
};

export function UserMenuContent({ user, onOpenLogout }: Props) {
    const cleanup = useMobileNavigation();
    const { t } = useTranslations();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={paths.settings.profile}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserRound className="mr-2 size-4" />
                        {t('settings.profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={paths.settings.orders}
                        prefetch
                        onClick={cleanup}
                    >
                        <Package className="mr-2 size-4" />
                        {t('settings.orders')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={paths.settings.root}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2 size-4" />
                        {t('nav.settings')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={(event) => {
                    event.preventDefault();
                    cleanup();
                    onOpenLogout();
                }}
                data-test="logout-button"
            >
                <LogOut className="mr-2 size-4" />
                {t('nav.log_out')}
            </DropdownMenuItem>
        </>
    );
}
