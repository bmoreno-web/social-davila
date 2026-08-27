'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Cambiar a modo Claro' : 'Cambiar a modo Oscuro'}
      aria-label="Alternar tema claro y oscuro"
      className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
        isDark
          ? 'bg-zinc-900/90 text-amber-300 border border-zinc-800 hover:border-amber-400/50 hover:bg-zinc-850 hover:shadow-lg hover:shadow-amber-500/10'
          : 'bg-zinc-100 text-purple-700 border border-zinc-300 hover:border-purple-500 hover:bg-white shadow-sm hover:shadow-purple-500/10'
      } ${className}`}
    >
      <div className="relative h-4 w-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-amber-300" />
        ) : (
          <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-amber-500" />
        )}
      </div>
    </button>
  );
}
