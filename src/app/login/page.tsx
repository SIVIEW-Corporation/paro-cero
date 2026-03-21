'use client';

import { useRouter } from 'next/navigation';
import { LoginScreen } from '@/app/screens/screens1';
import { useAuthStore } from '@/app/stores/use-auth-store';
import type { Usuario } from '@/app/data/types';

const MOCK_USER: Usuario = {
  id: 'U001',
  empresaId: 'EMP001',
  email: 'supervisor@apex.com',
  nombre: 'Carlos Mendez',
  rol: 'supervisor',
  activo: true,
  createdAt: new Date('2024-01-01'),
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    login(MOCK_USER);
    router.push('/');
  };

  return <LoginScreen onLogin={handleLogin} />;
}
