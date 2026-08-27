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
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
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
