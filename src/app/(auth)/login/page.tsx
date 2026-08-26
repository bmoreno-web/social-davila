'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Sparkles, BarChart3, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (data.user.role === 'CLIENT') {
        router.push('/portal');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('davila2026!');
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 text-white shadow-xl shadow-purple-900/30 mb-4 border border-purple-500/30">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            DAVILA PM <span className="text-purple-400 font-light">SOCIAL</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Plataforma de Analítica, Reporting y Experiencia de Cliente
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Acceso a la plataforma</h2>
            <p className="text-xs text-zinc-400">Ingresa tus credenciales de agencia o portal cliente</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@davilapm.com"
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              isLoading={isLoading}
            >
              Iniciar Sesión <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Demo Quick Access */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-3 text-center">
              Acceso Rápido para Demostración
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('admin@davilapm.com')}
                className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 text-[11px] text-zinc-300 hover:text-white transition-all text-center"
              >
                <span className="block font-semibold text-purple-400">Admin</span>
                Davila PM
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('team@davilapm.com')}
                className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 text-[11px] text-zinc-300 hover:text-white transition-all text-center"
              >
                <span className="block font-semibold text-sky-400">Equipo</span>
                Analista
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('cliente@acesco.com')}
                className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 text-[11px] text-zinc-300 hover:text-white transition-all text-center"
              >
                <span className="block font-semibold text-amber-400">Cliente</span>
                Acesco Col
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          © 2026 Davila PM — Motor de Analítica & Reporting Digital
        </p>
      </div>
    </div>
  );
}
