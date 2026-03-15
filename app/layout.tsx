import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waityr — Something is coming.',
  description:
    "Get in line. A waitlist for something. We're not ready to share what it is yet. This is standard practice.",
  openGraph: {
    title: 'Waityr — Something is coming.',
    description: 'Get in line.',
    url: 'https://waityr.com',
    siteName: 'Waityr',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Waityr — Something is coming.',
    description: 'Get in line.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
