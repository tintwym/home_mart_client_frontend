import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { ChatbotWidget } from '@/components/chatbot-widget';
import { CartDrawer } from '@/components/cart-drawer';
import type { AppLayoutProps } from '@/types';
import { ToastProvider } from '@/components/ui/toast';
import { LocalizationProvider } from '@/components/localization-provider';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <ToastProvider>
            <LocalizationProvider>
                <AppShell>
                    <AppHeader breadcrumbs={breadcrumbs} />
                    <AppContent>{children}</AppContent>
                    <ChatbotWidget />
                    <CartDrawer />
                </AppShell>
            </LocalizationProvider>
        </ToastProvider>
    );
}
