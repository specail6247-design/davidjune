'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/AuthContext';
import { Footer } from './components/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthProvider>
            {/* The main content for each page */}
            <main className="main-content">{children}</main>
            {/* A consistent footer for all pages */}
            <Footer />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
