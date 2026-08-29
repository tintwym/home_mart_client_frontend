'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    type Variants,
} from 'motion/react';
import { Home, Heart, Plus, ShoppingBag, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useSharedProps } from '@/lib/bootstrap';
import { useCart } from '@/hooks/use-cart';

const HIDDEN_PREFIXES = ['/checkout', '/two-factor-challenge'];

const spring = { type: 'spring' as const, stiffness: 420, damping: 32 };
const softSpring = { type: 'spring' as const, stiffness: 380, damping: 28 };

function shouldHide(pathname: string | null): boolean {
    if (!pathname) return false;
    return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type TabItem = {
    href: string;
    label: string;
    icon: typeof Home;
    active: boolean;
    badge?: number;
};

export function MobileBottomTabBar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const shared = useSharedProps();
    const { count: cartHookCount } = useCart();
    const cartCount = user
        ? cartHookCount
        : (shared.auth.cartCount ?? shared.auth.cartListingIds?.length ?? 0);
    const reduceMotion = useReducedMotion();

    if (shouldHide(pathname)) return null;

    const accountHref = user ? '/settings' : '/login';
    const accountActive = user
        ? pathname.startsWith('/settings')
        : pathname === '/login' || pathname === '/register';

    const tabs: TabItem[] = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
            active: pathname === '/',
        },
        {
            href: '/favorites',
            label: 'Saved',
            icon: Heart,
            active: pathname === '/favorites',
        },
        {
            href: '/cart',
            label: 'Cart',
            icon: ShoppingBag,
            active: pathname === '/cart' || pathname.startsWith('/checkout'),
            badge: cartCount,
        },
        {
            href: accountHref,
            label: user ? 'Account' : 'Log in',
            icon: user ? User : LogIn,
            active: accountActive,
        },
    ];

    const sellActive =
        pathname === '/listings/create' ||
        (pathname.startsWith('/listings/') && pathname.endsWith('/edit'));

    const barVariants: Variants = reduceMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : {
              hidden: { y: 72, opacity: 0 },
              visible: {
                  y: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.05 },
              },
          };

    return (
        <motion.nav
            initial="hidden"
            animate="visible"
            variants={barVariants}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 lg:hidden"
            style={{
                paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))',
            }}
            aria-label="Primary navigation"
        >
            <div className="pointer-events-auto relative mx-auto max-w-md">
                {/* Center sell FAB — floats above the bar */}
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[38%]">
                    <SellFab active={sellActive} reduceMotion={!!reduceMotion} />
                </div>

                {/* Glass pill bar */}
                <div
                    className={cn(
                        'relative overflow-hidden rounded-[1.75rem]',
                        'border border-border/50 bg-background/75 shadow-[0_8px_32px_-4px_oklch(0.66_0.115_175_/_0.18),0_4px_16px_-6px_oklch(0_0_0_/_0.08)]',
                        'backdrop-blur-xl backdrop-saturate-150',
                        'dark:border-white/10 dark:bg-background/65',
                        'dark:shadow-[0_8px_32px_-4px_oklch(0.76_0.11_175_/_0.22),0_4px_16px_-6px_oklch(0_0_0_/_0.35)]',
                    )}
                >
                    {/* Subtle top shimmer */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
                    />

                    <div className="grid h-[4.25rem] grid-cols-5 items-end px-1 pb-1.5 pt-2">
                        <TabLink
                            {...tabs[0]}
                            disabled={loading}
                            reduceMotion={!!reduceMotion}
                        />
                        <TabLink
                            {...tabs[1]}
                            disabled={loading}
                            reduceMotion={!!reduceMotion}
                            filledWhenActive
                        />

                        {/* Spacer for center FAB */}
                        <div aria-hidden className="flex flex-col items-center">
                            <span className="text-[10px] font-semibold text-primary/90">
                                Sell
                            </span>
                        </div>

                        <TabLink
                            {...tabs[2]}
                            disabled={loading}
                            reduceMotion={!!reduceMotion}
                        />
                        <TabLink
                            {...tabs[3]}
                            disabled={loading}
                            reduceMotion={!!reduceMotion}
                        />
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

function SellFab({
    active,
    reduceMotion,
}: {
    active: boolean;
    reduceMotion: boolean;
}) {
    return (
        <Link href="/listings/create" aria-label="Sell an item" aria-current={active ? 'page' : undefined}>
            <motion.span
                className="relative flex size-[3.35rem] items-center justify-center"
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                transition={softSpring}
            >
                {/* Glow ring */}
                {!reduceMotion ? (
                    <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-primary/25 blur-md"
                        animate={
                            active
                                ? { scale: [1, 1.18, 1], opacity: [0.45, 0.7, 0.45] }
                                : { scale: 1, opacity: 0.35 }
                        }
                        transition={
                            active
                                ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                                : { duration: 0.3 }
                        }
                    />
                ) : null}

                {/* Button body */}
                <motion.span
                    className={cn(
                        'relative flex size-[3.15rem] items-center justify-center rounded-full',
                        'bg-gradient-to-br from-primary via-primary to-[oklch(0.58_0.12_175)]',
                        'text-primary-foreground shadow-[0_6px_20px_-4px_oklch(0.66_0.115_175_/_0.55)]',
                        'ring-[3px] ring-background',
                    )}
                    animate={
                        reduceMotion
                            ? undefined
                            : active
                              ? { rotate: [0, -8, 8, 0] }
                              : { rotate: 0 }
                    }
                    transition={
                        active
                            ? { duration: 0.55, ease: 'easeInOut' }
                            : softSpring
                    }
                >
                    <motion.span
                        animate={
                            reduceMotion
                                ? undefined
                                : active
                                  ? { scale: [1, 1.15, 1] }
                                  : { scale: 1 }
                        }
                        transition={{ duration: 0.35 }}
                    >
                        <Plus className="size-7" strokeWidth={2.75} />
                    </motion.span>
                </motion.span>
            </motion.span>
        </Link>
    );
}

function TabLink({
    href,
    label,
    icon: Icon,
    active,
    badge,
    disabled,
    reduceMotion,
    filledWhenActive,
}: TabItem & {
    disabled?: boolean;
    reduceMotion: boolean;
    filledWhenActive?: boolean;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'relative flex flex-col items-center justify-end gap-1 py-0.5',
                disabled && 'pointer-events-none opacity-50',
            )}
        >
            <motion.span
                className="relative flex size-10 items-center justify-center"
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                transition={softSpring}
            >
                {active ? (
                    <motion.span
                        layoutId="mobile-tab-indicator"
                        className="absolute inset-0 rounded-2xl bg-primary/12 dark:bg-primary/20"
                        transition={spring}
                    />
                ) : null}

                <motion.span
                    className="relative z-[1]"
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                  y: active ? -1 : 0,
                                  scale: active ? 1.08 : 1,
                              }
                    }
                    transition={softSpring}
                >
                    <Icon
                        className={cn(
                            'size-[1.35rem] transition-colors duration-200',
                            active
                                ? 'text-primary'
                                : 'text-muted-foreground/85',
                            filledWhenActive &&
                                active &&
                                'fill-primary/25 stroke-primary',
                        )}
                        strokeWidth={active ? 2.35 : 1.85}
                    />
                </motion.span>

                <AnimatePresence>
                    {badge != null && badge > 0 ? (
                        <motion.span
                            key="badge"
                            initial={
                                reduceMotion
                                    ? false
                                    : { scale: 0, opacity: 0 }
                            }
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={spring}
                            className="count-badge z-[2] !-right-1 !-top-1.5 text-[9px]"
                        >
                            {badge > 99 ? '99+' : badge}
                        </motion.span>
                    ) : null}
                </AnimatePresence>
            </motion.span>

            <motion.span
                className={cn(
                    'text-[10px] leading-none tracking-wide',
                    active
                        ? 'font-semibold text-primary'
                        : 'font-medium text-muted-foreground/75',
                )}
                animate={
                    reduceMotion
                        ? undefined
                        : { opacity: active ? 1 : 0.82, y: active ? 0 : 1 }
                }
                transition={{ duration: 0.2 }}
            >
                {label}
            </motion.span>
        </Link>
    );
}
