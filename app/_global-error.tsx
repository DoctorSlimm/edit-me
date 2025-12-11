'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error directly without useEffect to avoid async storage issues during build
  if (typeof window !== 'undefined') {
    console.error('Global error:', error);
  }

  return (
    <html suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f5f5f5'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            Something went wrong!
          </h1>
          <p style={{ marginBottom: '1rem', color: '#666', maxWidth: '500px' }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.875rem', color: '#999', marginBottom: '1rem' }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#0051cc';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#0070f3';
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
