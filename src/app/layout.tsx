import type { Metadata, Viewport } from 'next';
import { Fraunces } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Habitly — Track What Matters',
  description: 'A clean, minimal habit tracker to build routines that stick.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habitly',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'Habitly',
    description: 'Track your daily habits with clarity',
  },
};

export const viewport: Viewport = {
  themeColor: '#4a7d4e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fraunces.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-stone-50 text-stone-800 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#292524',
              color: '#fafaf9',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Geist, system-ui, sans-serif',
            },
            success: { iconTheme: { primary: '#4a7d4e', secondary: '#fafaf9' } },
            error: { iconTheme: { primary: '#c4826a', secondary: '#fafaf9' } },
          }}
        />
      </body>
    </html>
  );
}
