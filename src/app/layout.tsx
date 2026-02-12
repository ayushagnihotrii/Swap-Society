import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileTabBar from '@/components/layout/MobileTabBar';
import ScrollToTop from '@/components/ui/ScrollToTop';
import PageTransition from '@/components/providers/PageTransition';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'SwapSociety — Rent & Buy from Fellow Students',
  description:
    'The Gen Z student marketplace. Rent or buy clothes, electronics, books & more from university students near you.',
  keywords: ['swap', 'rent', 'buy', 'sell', 'student', 'university', 'marketplace', 'second-hand'],
  openGraph: {
    title: 'SwapSociety — Rent & Buy from Fellow Students',
    description: 'The Gen Z student marketplace.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="page-wrapper">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <MobileTabBar />
            <ScrollToTop />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
