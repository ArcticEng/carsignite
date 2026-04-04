import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'CarsIgnite — Win Supercars, Watches & Luxury Homes',
  description: 'South Africa\'s premier supercar community. Register free for 1 draw entry. GPS tracking, crew chat, group drives, and luxury giveaways. No purchase necessary.',
  keywords: ['CarsIgnite', 'supercar', 'giveaway', 'South Africa', 'luxury', 'car community', 'win a car', 'prize draw'],
  authors: [{ name: 'CarsIgnite (Pty) Ltd' }],
  openGraph: {
    title: 'CarsIgnite — Win Supercars, Watches & Luxury Homes',
    description: 'Register free for 1 draw entry. South Africa\'s premier supercar community with GPS tracking, crew chat, and luxury giveaways.',
    url: 'https://carsignite.co.za',
    siteName: 'CarsIgnite',
    images: [
      {
        url: 'https://static.wixstatic.com/media/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg/v1/fill/w_1200,h_630,al_c,q_90/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg',
        width: 1200,
        height: 630,
        alt: 'CarsIgnite — Win Supercars',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarsIgnite — Win Supercars, Watches & Luxury Homes',
    description: 'Register free for 1 draw entry. SA\'s premier supercar community.',
    images: ['https://static.wixstatic.com/media/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg/v1/fill/w_1200,h_630,al_c,q_90/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23E03455'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold' font-size='18'%3ECI%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
            <CookieConsent />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
