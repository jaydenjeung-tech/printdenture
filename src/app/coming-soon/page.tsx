// app/coming-soon/page.tsx

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PrintCrown — Coming Soon',
  description: 'A better way to order dental restorations.',
}

export default function ComingSoonPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Space+Grotesk:wght@300;400&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expand {
          from { opacity: 0; width: 0; }
          to   { opacity: 1; width: 40px; }
        }

        .cs-wrap {
          min-height: 100vh;
          background: #0E0C0A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }
        .cs-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .cs-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: #C8A96E;
          text-transform: uppercase;
          margin-bottom: 52px;
          opacity: 0;
          animation: fadeIn 1s ease forwards 0.2s;
        }
        .cs-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.15;
          color: #F0EBE1;
          text-align: center;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeIn 1s ease forwards 0.6s;
        }
        .cs-line {
          width: 40px;
          height: 1px;
          background: #C8A96E;
          margin-bottom: 32px;
          opacity: 0;
          animation: expand 1s ease forwards 1s;
        }
        .cs-sub {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: #7A6A52;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeIn 1s ease forwards 1.3s;
        }
      `}</style>

      <div className="cs-wrap">
        <div className="cs-glow" />
        <p className="cs-logo">PrintCrown</p>
        <h1 className="cs-headline">
          A better way to order<br />dental restorations.
        </h1>
        <div className="cs-line" />
        <p className="cs-sub">Coming Soon</p>
      </div>
    </>
  )
}