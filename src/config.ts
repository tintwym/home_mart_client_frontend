/**
 * App configuration (no NEXT_PUBLIC_* env vars required on Vercel).
 *
 * Firebase web client values are not secret — Google documents that the API key
 * identifies your project; lock down usage via Firebase Console → Authorized
 * domains and API key restrictions.
 */
export const Config = {
    firebase: {
        apiKey: 'AIzaSyDTsElv1hReVoozmEuagmdrfQ4NaDq2BLg',
        authDomain: 'device-streaming-d800dc83.firebaseapp.com',
        projectId: 'device-streaming-d800dc83',
        storageBucket: 'device-streaming-d800dc83.firebasestorage.app',
        messagingSenderId: '222807773776',
        appId: '1:222807773776:web:dd0cc0ff20142921cbb755',
    },
} as const;

export type FirebaseWebConfig = (typeof Config)['firebase'];

export function isFirebaseConfigured(): boolean {
    const { apiKey, authDomain, projectId, appId } = Config.firebase;
    return Boolean(apiKey && authDomain && projectId && appId);
}
