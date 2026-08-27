import { Link, router } from '@/lib/app-client';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    Heart,
    LogOut,
    Menu,
    MessageCircle,
    Search,
    Settings,
    ShoppingCart,
    User,
    Clock,
} from 'lucide-react';
import { ChevronDown, Layers } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LocationIndicator } from '@/components/location-indicator';
import { CurrencySwitcher } from '@/components/currency-switcher';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { toUrl } from '@/lib/utils';
import { paths } from '@/lib/paths';
import { useSharedProps } from '@/lib/bootstrap';
import type {
    BreadcrumbItem,
    NavItem,
    SharedCategory,
    SharedCategoryTreeNode,
    SharedData,
} from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [];

const rightNavItems: NavItem[] = [];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const shared = useSharedProps();
    const pathname = usePathname() || '/';
    const searchParams = useSearchParams();
    const { t, categoryName } = useTranslations();
    const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);
    const {
        auth,
        categories = [],
        categoryTree = [],
    } = shared as SharedData & {
        categoryTree?: SharedCategoryTreeNode[];
        categories?: SharedCategory[];
    };
    const searchQuery =
        (shared as { searchQuery?: string }).searchQuery ?? '';
    const currentLocation = searchParams.get('location') ?? null;
    const getInitials = useInitials();
    const mobileNavCleanup = useMobileNavigation();
    const [headerLogoutOpen, setHeaderLogoutOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('recent_searches');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(
                            (item): item is string => typeof item === 'string',
                        );
                    }
                }
            } catch (err) {
                console.error('Failed to load recent searches', err);
            }
        }
        return [];
    });
    const [showRecentDropdown, setShowRecentDropdown] = useState(false);
    const dropdownRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowRecentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveSearchQuery = (q: string) => {
        if (!q.trim()) return;
        const query = q.trim();
        setRecentSearches((prev) => {
            const next = [
                query,
                ...prev.filter(
                    (item) => item.toLowerCase() !== query.toLowerCase(),
                ),
            ].slice(0, 6);
            localStorage.setItem('recent_searches', JSON.stringify(next));
            return next;
        });
    };

    // From iPad mini (md) up: don't show the side drawer
    useEffect(() => {
        const closeIfMdOrUp = () => {
            if (window.matchMedia('(min-width: 768px)').matches) {
                setSheetOpen(false);
            }
        };
        closeIfMdOrUp();
        window.addEventListener('resize', closeIfMdOrUp);
        return () => window.removeEventListener('resize', closeIfMdOrUp);
    }, []);

    const currentPath = pathname;
    const searchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q =
            (
                form.elements.namedItem('q') as HTMLInputElement | null
            )?.value?.trim() ?? '';

        saveSearchQuery(q);

        const searchParams = new URLSearchParams();
        if (q) searchParams.set('q', q);
        if (currentLocation) searchParams.set('location', currentLocation);
        const queryString = searchParams.toString();
        router.get(
            queryString ? `/?${queryString}` : '/',
            {},
            { preserveState: false },
        );
        setShowRecentDropdown(false);
    };

    const topCategoriesForBar: SharedCategoryTreeNode[] =
        categoryTree.length > 0
            ? categoryTree
            : categories
                  .filter((c) => !c.category_id)
                  .map((c) => ({ ...c, children: [] }));

    const sidebarCategoryTree: SharedCategoryTreeNode[] =
        categoryTree.length > 0
            ? categoryTree
            : categories
                  .filter((c) => !c.category_id)
                  .map((c) => ({ ...c, children: [] }));

    return (
        <>
            <div
                className="sticky top-0 z-50 border-b border-primary/15 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_12%,transparent)] backdrop-blur-md"
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                    paddingBottom: 0,
                    backgroundColor: 'var(--header-tint)',
                }}
            >
                {/* Row 1: Logo left, search center, icons right — from iPad mini (md) up same as desktop */}
                <div className="mx-auto flex h-12 min-h-12 flex-nowrap items-center gap-1.5 px-2 sm:flex-wrap sm:gap-2 sm:px-4 md:h-14 md:min-h-14 md:max-w-7xl md:gap-4 md:px-6">
                    {/* Left: hamburger (mobile), logo */}
                    <div className="flex shrink-0 items-center gap-1.5 md:gap-4">
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex h-9 min-h-9 w-9 min-w-9 touch-manipulation sm:h-10 sm:min-h-10 sm:w-10 sm:min-w-10"
                                aria-label={t('nav.open_menu')}
                                onClick={() => setSheetOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                        <Link
                            href={paths.home}
                            prefetch
                            className="flex shrink-0 items-center space-x-2"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Center: search bar — grows with row; cap widens on larger breakpoints */}
                    <div className="relative z-0 flex min-w-0 flex-2 basis-0 justify-center md:min-w-0 md:flex-1 md:basis-0 md:justify-center md:px-3 lg:px-4">
                        <form
                            ref={dropdownRef}
                            onSubmit={searchFormSubmit}
                            className="relative w-full max-w-full min-w-0 md:max-w-3xl lg:max-w-4xl"
                        >
                            <div className="relative flex min-w-0 items-center overflow-hidden rounded-lg border border-primary/20 bg-card shadow-xs">
                                <input
                                    type="search"
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder={t('search.placeholder')}
                                    className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-10 pl-3 text-sm outline-none placeholder:text-muted-foreground md:pr-10 md:pl-4"
                                    aria-label={t('search.aria')}
                                    onFocus={() => setShowRecentDropdown(true)}
                                />
                                <button
                                    type="submit"
                                    className="absolute top-0 right-0 flex h-full min-h-11 w-10 items-center justify-center bg-transparent text-muted-foreground transition-colors hover:text-foreground md:h-9 md:min-h-0 md:w-10"
                                    aria-label={t('search.button')}
                                >
                                    <Search className="size-5 shrink-0" />
                                </button>
                            </div>

                            {/* Recent Searches Dropdown */}
                            {showRecentDropdown &&
                                recentSearches.length > 0 && (
                                    <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border border-border/80 bg-background py-2 text-foreground shadow-lg dark:border-border/30">
                                        <div className="flex items-center justify-between border-b border-border/40 px-3 pt-1 pb-1.5 text-xs font-semibold text-muted-foreground">
                                            <span>
                                                {t('nav.recent_searches')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setRecentSearches([]);
                                                    localStorage.removeItem(
                                                        'recent_searches',
                                                    );
                                                }}
                                                className="cursor-pointer transition-colors hover:text-destructive"
                                            >
                                                {t('nav.clear_all')}
                                            </button>
                                        </div>
                                        <ul className="max-h-60 overflow-y-auto py-1">
                                            {recentSearches.map(
                                                (item, index) => (
                                                    <li key={index}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const searchInput =
                                                                    dropdownRef.current?.querySelector(
                                                                        'input[name="q"]',
                                                                    ) as HTMLInputElement | null;
                                                                if (
                                                                    searchInput
                                                                ) {
                                                                    searchInput.value =
                                                                        item;
                                                                    saveSearchQuery(
                                                                        item,
                                                                    );

                                                                    const searchParams =
                                                                        new URLSearchParams();
                                                                    searchParams.set(
                                                                        'q',
                                                                        item,
                                                                    );
                                                                    if (
                                                                        currentLocation
                                                                    )
                                                                        searchParams.set(
                                                                            'location',
                                                                            currentLocation,
                                                                        );
                                                                    router.get(
                                                                        `/?${searchParams.toString()}`,
                                                                        {},
                                                                        {
                                                                            preserveState: false,
                                                                        },
                                                                    );
                                                                }
                                                                setShowRecentDropdown(
                                                                    false,
                                                                );
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                                                        >
                                                            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="flex-1 truncate">
                                                                {item}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </form>
                    </div>

                    {/* Right: region/currency, inbox, wishlist, cart, profile */}
                    <div className="relative z-30 flex shrink-0 items-center gap-0.5 md:gap-2">
                        <div className="hidden items-center gap-1.5 sm:flex">
                            <LocationIndicator />
                            <CurrencySwitcher />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative flex h-11 min-h-11 w-11 min-w-11 cursor-pointer touch-manipulation sm:h-9 sm:w-9"
                            aria-label={t('nav.chat')}
                            title={t('nav.chat')}
                            onClick={() => router.get('/inbox')}
                        >
                            <MessageCircle className="size-5 opacity-80" />
                            {(auth?.chatUnreadCount ?? 0) > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                    {(auth?.chatUnreadCount ?? 0) > 99
                                        ? '99+'
                                        : auth?.chatUnreadCount}
                                </span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative flex h-11 min-h-11 w-11 min-w-11 cursor-pointer touch-manipulation sm:h-9 sm:w-9"
                            aria-label={t('nav.wishlist')}
                            title={t('nav.favorites')}
                            onClick={() => router.get('/favorites')}
                        >
                            <Heart className="size-5 opacity-80" />
                            {(auth?.favoriteListingIds?.length ?? 0) > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                    {auth?.favoriteListingIds?.length}
                                </span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative flex h-11 min-h-11 w-11 min-w-11 cursor-pointer touch-manipulation sm:h-9 sm:w-9"
                            aria-label={t('nav.cart')}
                            title={t('nav.cart')}
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent('open-cart-drawer'),
                                );
                            }}
                        >
                            <ShoppingCart className="size-5 opacity-80" />
                            {(auth?.cartCount ?? 0) > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                    {(auth?.cartCount ?? 0) > 99
                                        ? '99+'
                                        : auth?.cartCount}
                                </span>
                            )}
                        </Button>
                        <div className="ml-1 hidden gap-1 md:flex">
                            {rightNavItems.map((item) => (
                                <TooltipProvider
                                    key={item.title}
                                    delayDuration={0}
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <span className="sr-only">
                                                    {item.title}
                                                </span>
                                                {item.icon && (
                                                    <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                        {/* Account menu: desktop/tablet only — mobile uses the hamburger sidebar */}
                        <div className="hidden md:block">
                            {auth?.user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex size-10 min-h-11 min-w-11 touch-manipulation rounded-full p-0.5 sm:size-9 sm:min-h-9 sm:min-w-9"
                                                aria-label={t('nav.user_menu')}
                                            >
                                                <Avatar className="size-8 overflow-hidden rounded-full sm:size-8">
                                                    <AvatarImage
                                                        src={auth.user.avatar}
                                                        alt={auth.user.name}
                                                    />
                                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                        {getInitials(
                                                            auth.user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-56"
                                            align="end"
                                        >
                                            <UserMenuContent
                                                user={auth.user}
                                                onOpenLogout={() =>
                                                    setHeaderLogoutOpen(true)
                                                }
                                            />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <LogoutConfirmDialog
                                        open={headerLogoutOpen}
                                        onOpenChange={setHeaderLogoutOpen}
                                        onLogout={mobileNavCleanup}
                                    />
                                </>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex h-11 min-h-11 touch-manipulation items-center gap-1.5 rounded-full px-2 pr-2.5 sm:h-9 sm:px-1.5 sm:pr-2"
                                            aria-label={t('nav.user_menu')}
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full sm:size-8">
                                                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    <User className="size-4 opacity-80" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <ChevronDown className="size-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <DropdownMenuLabel>
                                            {t('nav.account_and_lists')}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="block w-full cursor-pointer"
                                                    href={paths.login}
                                                    prefetch
                                                >
                                                    {t('nav.log_in')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="block w-full cursor-pointer"
                                                    href={paths.register}
                                                    prefetch
                                                >
                                                    {t('nav.register')}
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Category bar — hidden on mobile; from iPad mini (md) up same as desktop (scrollable row) */}
                <div className="hidden border-t border-primary/10 bg-linear-to-r from-primary/8 via-secondary/15 to-accent/10 md:block">
                    <div className="mx-auto max-w-7xl scrollbar-none px-6 py-2 md:overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        <div className="flex min-w-0 items-center justify-start gap-2 text-sm md:min-w-max md:flex-nowrap md:pr-4">
                            {/* All: link to home, no icon, no highlight color */}
                            <Link
                                href="/"
                                className="flex shrink-0 items-center rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                {t('nav.all')}
                            </Link>
                            <nav className="flex shrink-0 items-center gap-2 md:flex-nowrap">
                                {topCategoriesForBar.slice(0, 14).map((cat) => {
                                    const activeParent =
                                        currentPath ===
                                        `/categories/${cat.slug}`;
                                    const activeChild = (
                                        cat.children ?? []
                                    ).some(
                                        (child) =>
                                            currentPath ===
                                            `/categories/${child.slug}`,
                                    );
                                    const isActive =
                                        activeParent || activeChild;

                                    return (
                                        <DropdownMenu key={cat.id}>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground ${
                                                        isActive
                                                            ? 'bg-primary font-medium text-primary-foreground'
                                                            : 'text-muted-foreground hover:text-accent-foreground'
                                                    }`}
                                                >
                                                    <span>
                                                        {categoryName(cat)}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                className="w-56"
                                            >
                                                {(cat.children ?? []).length >
                                                0 ? (
                                                    <>
                                                        {cat.children?.map(
                                                            (child) => (
                                                                <DropdownMenuItem
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/categories/${child.slug}`}
                                                                        className="w-full"
                                                                    >
                                                                        {categoryName(
                                                                            child,
                                                                        )}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            ),
                                                        )}
                                                        <DropdownMenuSeparator />
                                                    </>
                                                ) : null}
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/categories/${cat.slug}`}
                                                        className="w-full"
                                                    >
                                                        {t('nav.view_all')}
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared sheet (mobile hamburger + row 3 "All") */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    side="left"
                    className="flex h-dvh min-h-0 w-[min(20rem,85vw)] touch-pan-y flex-col items-stretch overflow-y-auto overscroll-contain bg-sidebar pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] [-webkit-overflow-scrolling:touch] md:h-full md:w-[min(22rem,85vw)] md:overflow-visible"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <SheetTitle className="sr-only">
                        {t('nav.navigation_menu')}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        {t('nav.menu_sheet_description')}
                    </SheetDescription>
                    <SheetHeader className="flex justify-start text-left">
                        <Link
                            href={paths.home}
                            prefetch
                            onClick={() => setSheetOpen(false)}
                            className="flex items-center gap-3 rounded-md py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                <AppLogoIcon className="size-full object-contain p-1.5" />
                            </div>
                            <div className="flex min-w-0 flex-col text-left">
                                <span className="text-lg leading-tight font-bold text-foreground">
                                    Home Mart
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t('nav.tagline')}
                                </span>
                            </div>
                        </Link>
                    </SheetHeader>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="flex flex-col gap-1 text-sm">
                            {categories.length > 0 && (
                                <Collapsible
                                    defaultOpen={false}
                                    className="group/cat"
                                >
                                    <CollapsibleTrigger className="flex min-h-11 w-full touch-manipulation items-center justify-between rounded-md px-2 py-2 font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                        <span className="flex items-center gap-2">
                                            <Layers className="h-4 w-4" />
                                            {t('nav.categories')}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/cat:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="ml-2 flex flex-col gap-0.5 border-l border-sidebar-border py-2 pl-4">
                                            {sidebarCategoryTree.map(
                                                (parent) => (
                                                    <li key={parent.id}>
                                                        <Collapsible
                                                            defaultOpen={false}
                                                            className="group/parent"
                                                        >
                                                            <CollapsibleTrigger className="flex min-h-11 w-full touch-manipulation items-center justify-between py-2.5 font-semibold hover:underline active:opacity-80">
                                                                <span>
                                                                    {categoryName(
                                                                        parent,
                                                                    )}
                                                                </span>
                                                                <ChevronDown className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]/parent:rotate-180" />
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <ul className="mb-2 ml-3 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                                                                    <li>
                                                                        <Link
                                                                            href={`/categories/${parent.slug}`}
                                                                            onClick={() =>
                                                                                setSheetOpen(
                                                                                    false,
                                                                                )
                                                                            }
                                                                            className="block min-h-10 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline active:opacity-80"
                                                                        >
                                                                            {t(
                                                                                'nav.view_all',
                                                                            )}
                                                                        </Link>
                                                                    </li>
                                                                    {Array.isArray(
                                                                        parent.children,
                                                                    ) &&
                                                                        parent
                                                                            .children
                                                                            .length >
                                                                            0 &&
                                                                        parent.children.map(
                                                                            (
                                                                                child: SharedCategory,
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        child.id
                                                                                    }
                                                                                >
                                                                                    <Link
                                                                                        href={`/categories/${child.slug}`}
                                                                                        onClick={() =>
                                                                                            setSheetOpen(
                                                                                                false,
                                                                                            )
                                                                                        }
                                                                                        className="block min-h-10 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline active:opacity-80"
                                                                                    >
                                                                                        {categoryName(
                                                                                            child,
                                                                                        )}
                                                                                    </Link>
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                </ul>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                >
                                    {item.icon && (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col gap-0.5 border-t border-sidebar-border pt-2">
                            <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 sm:hidden">
                                <LocationIndicator />
                                <CurrencySwitcher />
                            </div>
                            <Link
                                href="/inbox"
                                onClick={() => setSheetOpen(false)}
                                className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>{t('nav.chat')}</span>
                            </Link>
                            <Link
                                href="/favorites"
                                onClick={() => setSheetOpen(false)}
                                className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent md:hidden"
                            >
                                <Heart className="h-4 w-4" />
                                <span>{t('nav.favorites')}</span>
                            </Link>
                            <Link
                                href="/download"
                                onClick={() => setSheetOpen(false)}
                                className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent md:hidden"
                            >
                                {t('nav.download_app')}
                            </Link>
                            {rightNavItems.map((item) => (
                                <a
                                    key={item.title}
                                    href={toUrl(item.href)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium"
                                >
                                    {item.icon && (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </a>
                            ))}
                            {auth?.user ? (
                                <>
                                    <div className="flex min-h-11 items-center gap-3 rounded-md px-2 py-1.5">
                                        <Avatar className="size-9 shrink-0 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate text-sm font-medium">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                    <Link
                                        href={paths.settings.root}
                                        className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        <Settings className="h-4 w-4" />
                                        {t('nav.settings')}
                                    </Link>
                                    <button
                                        type="button"
                                        className="flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 text-left font-medium hover:bg-sidebar-accent"
                                        onClick={() =>
                                            setSidebarLogoutOpen(true)
                                        }
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t('nav.log_out')}
                                    </button>
                                    <LogoutConfirmDialog
                                        open={sidebarLogoutOpen}
                                        onOpenChange={setSidebarLogoutOpen}
                                    />
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={paths.login}
                                        className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        {t('nav.log_in')}
                                    </Link>
                                    <Link
                                        href={paths.register}
                                        className="flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        {t('nav.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                    <div className="mx-auto flex min-h-11 w-full max-w-7xl items-center justify-start px-3 py-2 text-neutral-500 sm:px-4 sm:py-2.5">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
