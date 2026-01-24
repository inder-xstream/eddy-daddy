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
    } else if (auth === 'signup') {
      openModal('signup');
    }
    
    // Optional: Clean up URL after opening (but might be annoying if refreshing)
    // if (auth) {
    //   const params = new URLSearchParams(searchParams.toString());
    //   params.delete('auth');
    //   router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // }
  }, [searchParams, openModal]);

  return null;
}
