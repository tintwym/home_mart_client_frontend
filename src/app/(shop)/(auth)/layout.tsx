'use client';

import { AuthModalLayout } from '@/components/auth-modal-layout';

export default function AuthShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthModalLayout>{children}</AuthModalLayout>;
}
