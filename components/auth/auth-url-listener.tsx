'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

export function AuthUrlListener() {
  const searchParams = useSearchParams();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'signin') {
      openModal('signin');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (auth === 'signup') {
      openModal('signup');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, openModal, router, pathname]);

  return null;
}
