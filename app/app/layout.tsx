
'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { AdminLayout } from '../components/AdminLayout';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};



export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? <AdminLayout>{children}</AdminLayout> : <AppShell>{children}</AppShell>;
}


