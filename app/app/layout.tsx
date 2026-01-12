
'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { AdminLayout } from '../components/AdminLayout';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // Set the initial value
    setIsDesktop(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
};

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
    const isDesktop = useIsDesktop();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // On the server, and initial client render, render nothing or a loading indicator
        // to prevent hydration mismatch.
        return null; 
    }

    return isDesktop ? <AdminLayout>{children}</AdminLayout> : <AppShell>{children}</AppShell>;
}

