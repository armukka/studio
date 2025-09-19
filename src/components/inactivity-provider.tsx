"use client";

import { useInactivityLogout } from '@/hooks/use-inactivity-logout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export function InactivityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
    });
    router.push('/');
  };

  useInactivityLogout(handleLogout, INACTIVITY_TIMEOUT);

  return <>{children}</>;
}
