'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function NavigationWrapper() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login') return null;

  return <Navigation />;
}
