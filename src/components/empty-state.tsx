import { Link } from '@/lib/inertia-compat';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag, Heart, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    title: string;
    description: string;
    type: 'favorites' | 'listings' | 'generic';
    actionLabel?: string;
    actionHref?: string;
    onActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function EmptyState({
    title,
    description,
    type,
    actionLabel = 'Browse Items',
    actionHref = '/',
    onActionClick,
}: Props) {
    // Elegant background and icon representation based on type
    const getVisual = () => {
        switch (type) {
            case 'favorites':
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-red-50/50 dark:bg-red-950/10">
                        {/* Soft pulsing heart rings */}
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.15, 0.3, 0.15],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-2xl border-2 border-red-500/20"
                        />
                        <Heart className="size-10 fill-red-500/10 text-red-500" />
                    </div>
                );
            case 'listings':
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-amber-50/50 dark:bg-amber-950/10">
                        {/* Soft breathing ring */}
                        <motion.div
                            animate={{
                                scale: [1, 1.12, 1],
                                opacity: [0.15, 0.25, 0.15],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3.5,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-2xl border-2 border-amber-500/20"
                        />
                        <LayoutGrid className="size-10 text-amber-500" />
                    </div>
                );
            default:
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-2xl border-2 border-zinc-500/10"
                        />
                        <ShoppingBag className="size-10 text-zinc-400" />
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200/80 bg-zinc-50/30 px-6 py-16 text-center dark:border-zinc-800/60 dark:bg-zinc-950/20"
        >
            {/* Elegant Illustration / Floating Icon Box */}
            <div className="mb-6 flex justify-center">
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: 'easeInOut',
                    }}
                    whileHover={{ scale: 1.05 }}
                >
                    {getVisual()}
                </motion.div>
            </div>

            {/* Typography */}
            <h3 className="font-sans text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {description}
            </p>

            {/* Custom Styled Browse Items Button */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
            >
                {onActionClick ? (
                    <Button
                        size="lg"
                        onClick={onActionClick}
                        className="group rounded-xl font-medium shadow-sm transition-all duration-200"
                    >
                        <span>{actionLabel}</span>
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                ) : (
                    <Button
                        asChild
                        size="lg"
                        className="group rounded-xl font-medium shadow-sm transition-all duration-200"
                    >
                        <Link href={actionHref}>
                            <span>{actionLabel}</span>
                            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                )}
            </motion.div>
        </motion.div>
    );
}
