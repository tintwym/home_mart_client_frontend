import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Home Mart';

export const metadata: Metadata = {
    title: {
        default: appName,
        template: `%s - ${appName}`,
    },
    description: 'Buy and sell locally on Home Mart',
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    rel="preconnect"
                    href="https://fonts.bunny.net"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|syne:600,700"
                    rel="stylesheet"
                />
            </head>
            <body className="font-sans antialiased">
                <Providers>{children}</Providers>
                <SpeedInsights />
            </body>
        </html>
    );
}
