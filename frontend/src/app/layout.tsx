import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Blog cá nhân',
  description: 'Trang blog cá nhân — viết bài, chia sẻ ảnh, tương tác',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
