'use client';

export default function GlobalError({
  error,
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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7F1D1D, #B91C1C)',
          fontFamily: 'Barlow, system-ui, sans-serif',
          color: '#FFFFFF',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: '#FBBF24',
              color: '#7F1D1D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1
            style={{
              fontFamily: '"Barlow Condensed", Barlow, sans-serif',
              fontSize: 40,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              margin: '0 0 8px',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 24px' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              cursor: 'pointer',
              border: 'none',
              borderRadius: 12,
              background: '#FBBF24',
              color: '#7F1D1D',
              fontFamily: '"Barlow Condensed", Barlow, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '12px 28px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
