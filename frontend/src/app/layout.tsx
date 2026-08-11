import type { Metadata } from 'next';
import { Sora, Dancing_Script, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin', 'latin-ext'],
});

const dancingScript = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lặng 24',
  description: 'Trang cá nhân — viết bài, chia sẻ ảnh, linh tinh',
  icons: {
    icon: 'logo.png',
    shortcut: 'logo.png',
    apple: 'logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sora.variable} ${dancingScript.variable} ${fraunces.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}