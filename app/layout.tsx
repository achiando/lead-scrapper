import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lead.tijwa.com'),
  title: {
    default: 'Dental Demo Pro - Professional Dental Websites',
    template: '%s | Dental Demo Pro'
  },
  description: 'Create stunning dental clinic websites with our AI-powered demo platform. Professional web design for dental practices.',
  keywords: ['dental websites', 'dental clinic design', 'dentist website builder', 'dental marketing', 'professional dental sites'],
  authors: [{ name: 'Dental Demo Pro' }],
  creator: 'Dental Demo Pro',
  publisher: 'Dental Demo Pro',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://lead.tijwa.com',
    title: 'Dental Demo Pro - Professional Dental Websites',
    description: 'Create stunning dental clinic websites with our AI-powered demo platform. Professional web design for dental practices.',
    siteName: 'Dental Demo Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dental Demo Pro - Professional Dental Websites',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Dental Demo Pro - Professional Dental Websites',
    description: 'Create stunning dental clinic websites with our AI-powered demo platform.',
    images: ['/og-image.jpg'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // App
  applicationName: 'Dental Demo Pro',
  category: 'Healthcare',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
