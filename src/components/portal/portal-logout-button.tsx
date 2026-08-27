'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PortalLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      isLoading={isLoading}
      className="h-8 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/20 gap-1.5 transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>Salir</span>
    </Button>
  );
}
