import { useSharedProps } from '@/lib/bootstrap';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { SharedData } from '@/types';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = useSharedProps().sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="relative flex min-h-dvh min-h-screen w-full flex-col">
                {children}
            </div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
