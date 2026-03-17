import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waityr — Something is coming.',
  description:
    "Get in line. A waitlist for something. We're not ready to share what it is yet. This is standard practice.",
  openGraph: {
    title: 'Waityr — Something is coming.',
    description: "Get in line. A waitlist for something. We're not ready to share what it is yet.",
    url: 'https://waityr.vercel.app',
    siteName: 'Waityr',
    type: 'website',
    images: [
      {
        url: 'https://waityr.vercel.app/logo.png',
        width: 1080,
        height: 1080,
        alt: 'Waityr — Something is coming.',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Waityr — Something is coming.',
    description: "Get in line.",
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
