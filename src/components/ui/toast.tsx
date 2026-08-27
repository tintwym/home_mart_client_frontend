import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';

export interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    toast: (props: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, duration);
        }
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastViewport toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 p-4 pointer-events-none sm:bottom-6 sm:right-6">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                        className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md transition-all duration-200 ${
                            t.variant === 'destructive'
                                ? 'bg-destructive/95 text-destructive-foreground border-destructive/30'
                                : t.variant === 'success'
                                ? 'bg-emerald-500/95 text-white border-emerald-600/30 dark:bg-emerald-600/95'
                                : t.variant === 'warning'
                                ? 'bg-amber-500/95 text-zinc-950 border-amber-600/30'
                                : 'bg-white/95 text-zinc-950 border-zinc-200 dark:bg-zinc-900/95 dark:text-zinc-50 dark:border-zinc-800'
                        }`}
                        style={{ originY: 1 }}
                    >
                        {/* Variant icon */}
                        <div className="flex shrink-0 pt-0.5">
                            {t.variant === 'success' && <CheckCircle2 className="size-5 text-white" />}
                            {t.variant === 'destructive' && <AlertCircle className="size-5 text-white" />}
                            {t.variant === 'warning' && <AlertTriangle className="size-5 text-zinc-950" />}
                            {t.variant === 'default' && <Info className="size-5 text-primary" />}
                        </div>

                        {/* Text */}
                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-semibold leading-none">{t.title}</h4>
                            {t.description && (
                                <p className={`text-xs leading-normal opacity-90`}>
                                    {t.description}
                                </p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none transition-opacity"
                            aria-label="Close notification"
                        >
                            <X className="size-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
