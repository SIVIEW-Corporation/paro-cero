'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginScreen } from '@/app/screens/screens1';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/');
  };

  return <LoginScreen onLogin={handleLogin} />;
}
