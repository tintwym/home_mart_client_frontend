'use client';

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily:
                        'Instrument Sans, ui-sans-serif, system-ui, sans-serif',
                    background: 'oklch(0.97 0.01 175)',
                    color: 'oklch(0.24 0.03 175)',
                }}
            >
                <div
                    style={{
                        maxWidth: 420,
                        padding: 32,
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            letterSpacing: '0.2em',
                            fontSize: 12,
                            textTransform: 'uppercase',
                            opacity: 0.6,
                        }}
                    >
                        500
                    </p>
                    <h1 style={{ fontSize: 28, margin: '12px 0 8px' }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.75 }}>
                        The shop couldn’t load. Try again, or return home.
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            justifyContent: 'center',
                            marginTop: 24,
                        }}
                    >
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                border: 0,
                                borderRadius: 12,
                                padding: '10px 16px',
                                background: 'oklch(0.45 0.09 175)',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            Try again
                        </button>
                        <a
                            href="/"
                            style={{
                                borderRadius: 12,
                                padding: '10px 16px',
                                background: 'white',
                                color: 'oklch(0.24 0.03 175)',
                                textDecoration: 'none',
                            }}
                        >
                            Back to home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
