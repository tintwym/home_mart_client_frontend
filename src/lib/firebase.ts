import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    type Auth,
    type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string | undefined,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as
        | string
        | undefined,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as
        | string
        | undefined,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string | undefined,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
    return Boolean(
        firebaseConfig.apiKey &&
            firebaseConfig.authDomain &&
            firebaseConfig.projectId &&
            firebaseConfig.appId,
    );
}

export function getFirebaseAuth(): Auth {
    if (!isFirebaseConfigured()) {
        throw new Error(
            'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID.',
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
