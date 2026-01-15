'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Footer } from './components/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              {/* The main content for each page */}
              <main className="main-content">{children}</main>
              {/* A consistent footer for all pages */}
              <Footer />
            </AuthProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
