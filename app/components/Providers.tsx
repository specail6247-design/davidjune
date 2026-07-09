'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../../lib/AuthContext';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
