import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Global metadata (title, description, manifest, etc.)
export const metadata: Metadata = {
  title: 'Online College - Quality Education for Everyone',
  description: 'Access world-class courses and resources with flexible learning paths designed for African learners.',
  manifest: '/manifest.json',

};


export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: true,
    themeColor: '#000000', // global themeColor
  };
}

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>

  );
}
