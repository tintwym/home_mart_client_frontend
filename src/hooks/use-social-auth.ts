'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
    isFirebaseConfigured,
    signInWithSocial,
    type SocialProvider,
} from '@/lib/firebase';

export function useSocialAuth() {
    const { loginWithFirebase } = useAuth();
    const router = useRouter();
    const [busyProvider, setBusyProvider] = useState<SocialProvider | null>(null);

    const available = isFirebaseConfigured();

    const signInWithProvider = useCallback(
        async (provider: SocialProvider) => {
            setBusyProvider(provider);
            try {
                const { idToken } = await signInWithSocial(provider);
                await loginWithFirebase(idToken);
                router.push('/');
            } finally {
                setBusyProvider(null);
            }
        },
        [loginWithFirebase, router],
    );

    return {
        available,
        busyProvider,
        isBusy: busyProvider !== null,
        signInWithProvider,
    };
}
