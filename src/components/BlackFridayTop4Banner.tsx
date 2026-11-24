'use client';

import { useState } from 'react';

export default function BlackFridayTop4Banner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('EXTRA15');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '1rem auto 1.5rem',
        maxWidth: '720px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        backgroundColor: '#040a17',
        boxShadow: '0 14px 28px -12px rgba(0, 0, 0, 0.45)',
      }}
    >
      <a
        href="https://top4running.fr?a_box=sc3esau3"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', lineHeight: 0 }}
      >
        <img
          src="/images/bf-top4running-wide.webp"
          alt="Black Friday Top4Running : -15% supplémentaires avec le code EXTRA15"
          style={{ width: '100%', height: 'auto', maxHeight: '190px', display: 'block', objectFit: 'cover', objectPosition: 'center top' }}
          loading="lazy"
        />
      </a>
      <div
        style={{
          padding: '0.65rem 1rem',
          background: 'linear-gradient(90deg, #071329 0%, #0a1a3a 50%, #071329 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            Black Friday
          </span>
          <span style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700 }}>
            -15 % supplémentaires chez Top4Running avec le code{' '}
            <strong style={{ color: '#fcb900', fontFamily: 'monospace' }}>EXTRA15</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copié ✓' : 'Copier EXTRA15'}
          </button>
          <a
            href="https://top4running.fr?a_box=sc3esau3"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#fcb900',
              color: '#000000',
              borderRadius: '10px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            Profiter de l&apos;offre →
          </a>
        </div>
      </div>
    </div>
  );
}
