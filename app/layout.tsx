import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waityr — Get in Line!',
  description:
    "A waitlist for something. We're not ready to share what it is yet. Something is coming.",
  openGraph: {
    title: 'Waityr — Get in Line!',
    description: "A live, competitive waitlist. Something is coming.",
    url: 'https://waityr.vercel.app',
    siteName: 'Waityr',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Waityr',
    description: "Queue up. The race for #1 starts now.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
