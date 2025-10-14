import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Global metadata
export const metadata: Metadata = {
  title: 'Collegia - Quality Education for Everyone',
  description:
    'Access world-class courses and resources with flexible learning paths designed for African learners.',
  manifest: '/manifest.json',
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: true,
    themeColor: '#000000',
  };
}

// Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}