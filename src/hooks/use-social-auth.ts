'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
    isTwoFactorRequired,
    TWO_FACTOR_EMAIL_HINT,
} from '@/lib/two-factor-redirect';
import {
    isFirebaseConfigured,
    signInWithSocial,
    type SocialProvider,
} from '@/lib/firebase';

export function useSocialAuth() {
    const { loginWithFirebase } = useAuth();
    const router = useRouter();
    const [busyProvider, setBusyProvider] = useState<SocialProvider | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    const available = isFirebaseConfigured();

    const signInWithProvider = useCallback(
        async (provider: SocialProvider) => {
            setBusyProvider(provider);
            setError(null);
            try {
                const { idToken } = await signInWithSocial(provider);
                await loginWithFirebase(idToken);
                router.push('/');
            } catch (err) {
                if (isTwoFactorRequired(err)) {
                    setError(TWO_FACTOR_EMAIL_HINT);
                    return;
                }
                throw err;
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
        error,
        signInWithProvider,
    };
}
