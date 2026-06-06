import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { DigiCraftBanner } from '@/components/DigiCraftBanner';

export const metadata: Metadata = {
  title: 'Kickoff Pool — World Cup Predictions',
  description: 'Predict World Cup match scores and compete with your friends on the leaderboard.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <DigiCraftBanner />
        <script src="/editor-hook.js" defer></script>
      </body>
    </html>
  );
}
