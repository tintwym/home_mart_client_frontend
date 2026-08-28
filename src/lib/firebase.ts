import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    type Auth,
    type UserCredential,
} from 'firebase/auth';
import { Config, isFirebaseConfigured } from '@/config';

export { isFirebaseConfigured };

const firebaseConfig = Config.firebase;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
    if (!isFirebaseConfigured()) {
        throw new Error(
            'Firebase is not configured. Update Config.firebase in src/config.ts.',
        );
    }
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    }
    return auth!;
}

export type SocialProvider = 'google' | 'apple';

export async function signInWithSocial(
    provider: SocialProvider,
): Promise<{ idToken: string; credential: UserCredential }> {
    const firebaseAuth = getFirebaseAuth();
    const authProvider =
        provider === 'google'
            ? new GoogleAuthProvider()
            : new OAuthProvider('apple.com');

    if (provider === 'google') {
        (authProvider as GoogleAuthProvider).setCustomParameters({
            prompt: 'select_account',
        });
    } else {
        (authProvider as OAuthProvider).addScope('email');
        (authProvider as OAuthProvider).addScope('name');
    }

    const credential = await signInWithPopup(firebaseAuth, authProvider);
    const idToken = await credential.user.getIdToken();
    return { idToken, credential };
}
