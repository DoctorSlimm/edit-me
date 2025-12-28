'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0066cc',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#ffff00', marginBottom: '1rem' }}>
          🎄 404 🎄
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1rem' }}>
          Sorry! Page Not Found
        </p>
        <p style={{ fontSize: '1rem', color: '#ffff00', marginBottom: '2rem' }}>
          It seems Santa couldn't find this page at the North Pole!
        </p>
        <Link
          href="/"
          style={{
            backgroundColor: '#cc3300',
            border: '2px solid #ffff00',
            padding: '0.75rem 1.5rem',
            color: '#ffff00',
            fontWeight: 'bold',
            display: 'inline-block',
            textDecoration: 'none',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = '#990000';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = '#cc3300';
          }}
        >
          Return to Home 🏠
        </Link>
      </div>
    </div>
  );
}
