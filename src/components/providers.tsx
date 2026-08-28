'use client';

import { AuthProvider } from '@/lib/auth';
import { BootstrapProvider } from '@/lib/bootstrap';
import { ToastProvider } from '@/components/ui/toast';
import { NavigationBridge } from '@/lib/navigation-bridge';
import { initializeTheme } from '@/hooks/use-appearance';
import { useEffect, type ReactNode } from 'react';

function ThemeInit() {
    useEffect(() => {
        initializeTheme();
    }, []);
    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <BootstrapProvider>
                <ToastProvider>
                    <ThemeInit />
                    <NavigationBridge />
                    {children}
                </ToastProvider>
            </BootstrapProvider>
        </AuthProvider>
    );
}
