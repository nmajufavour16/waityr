import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waityr — Queue as a Service',
  description:
    "A waitlist for something. Get in line.",
  openGraph: {
    title: 'Waityr — Queue as a Service',
    description: "A waitlist for something. Get in line.",
    url: 'https://waityr.vercel.app',
    siteName: 'Waityr',
    type: 'website',
    images: [
      {
        url: 'https://waityr.vercel.app/logo.png',
        width: 1080,
        height: 1080,
        alt: 'Waityr — Queue as a Service',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Waityr — Queue as a Service',
    description: "A waitlist for something. Get in line.",
    images: ['https://waityr.vercel.app/logo.png'],
  },
  verification: {
    google: 'zy6RrKC1-qHSR4tunhNMhJ92mZ37PM3bS4ehflbSAZI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Poppins — headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
        {/* DM Sans — body */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
