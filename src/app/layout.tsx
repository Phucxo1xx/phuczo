import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FoodVibe - Đánh Giá Quán Ăn & Trưa Nay Ăn Gì',
  description: 'Nền tảng review ẩm thực chân thực, quay roulette món ăn trưa nay ăn gì và rủ bạn bè đi ăn khắp Việt Nam.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen text-zinc-900 bg-zinc-50 font-sans antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
