import { Link } from '@/lib/app-client';
import { motion, useReducedMotion } from 'motion/react';
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
    const reduceMotion = useReducedMotion();

    const getVisual = () => {
        switch (type) {
            case 'favorites':
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-destructive/5 dark:bg-destructive/10">
                        {!reduceMotion ? (
                            <motion.div
                                animate={{
                                    scale: [1, 1.08, 1],
                                    opacity: [0.12, 0.22, 0.12],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: 'easeInOut',
                                }}
                                className="absolute inset-0 rounded-2xl border-2 border-destructive/15"
                            />
                        ) : null}
                        <Heart className="size-10 fill-destructive/10 text-destructive" />
                    </div>
                );
            case 'listings':
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-accent/30">
                        {!reduceMotion ? (
                            <motion.div
                                animate={{
                                    scale: [1, 1.06, 1],
                                    opacity: [0.12, 0.2, 0.12],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3.5,
                                    ease: 'easeInOut',
                                }}
                                className="absolute inset-0 rounded-2xl border-2 border-accent-foreground/10"
                            />
                        ) : null}
                        <LayoutGrid className="size-10 text-accent-foreground" />
                    </div>
                );
            default:
                return (
                    <div className="relative flex size-24 items-center justify-center rounded-2xl bg-muted/50">
                        {!reduceMotion ? (
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.08, 0.16, 0.08],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: 'easeInOut',
                                }}
                                className="absolute inset-0 rounded-2xl border-2 border-border"
                            />
                        ) : null}
                        <ShoppingBag className="size-10 text-muted-foreground" />
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center"
        >
            <div className="mb-6 flex justify-center">
                <motion.div
                    animate={
                        reduceMotion ? undefined : { y: [0, -4, 0] }
                    }
                    transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: 'easeInOut',
                    }}
                >
                    {getVisual()}
                </motion.div>
            </div>

            <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>

            <div className="mt-6">
                {onActionClick ? (
                    <Button
                        size="lg"
                        onClick={onActionClick}
                        className="group rounded-xl shadow-sm"
                    >
                        <span>{actionLabel}</span>
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                ) : (
                    <Button asChild size="lg" className="group rounded-xl shadow-sm">
                        <Link href={actionHref}>
                            <span>{actionLabel}</span>
                            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
