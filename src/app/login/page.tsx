'use client';

import { Suspense, type FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';

const DEMO_EMAIL = 'demo@jobtracker.com';
const DEMO_PASSWORD = 'Demo1234!';

export default function LoginPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const { login, isAuthenticated, isLoadingSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get('redirectTo') || '/dashboard',
    [searchParams],
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoadingSession) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoadingSession, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password, redirectTo);
    } catch (err) {
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : 'Credenciales invalidas. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutofill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  if (isLoadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-800">Verificando sesion...</p>
          <p className="text-sm text-slate-600">Comprobamos tu cookie para evitar parpadeos.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl bg-white/5 p-6 shadow-2xl backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div className="space-y-6 text-white">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              JobTracker
            </p>
            <h1 className="text-3xl font-bold">Inicia sesion para seguir tu busqueda</h1>
            <p className="text-sm text-slate-200">
              Usamos cookies httpOnly. No guardamos tokens en el navegador, solo verificamos tu
              sesion contra el backend.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
                  Credenciales demo
                </p>
                <p className="text-sm text-slate-100">
                  Usa este usuario para probar el flujo completo.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                type="button"
                onClick={handleAutofill}
              >
                Autocompletar demo
              </Button>
            </div>
            <div className="space-y-2 rounded-lg bg-black/20 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-200">Email</span>
                <span className="font-semibold text-white">{DEMO_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200">Password</span>
                <span className="font-semibold text-white">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Iniciar sesion</h2>
            <p className="text-sm text-slate-600">
              Ingresa tus datos para acceder al dashboard privado.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
          </Button>

          <p className="text-xs text-slate-500">
            Todas las peticiones usan cookies con credenciales incluidas. Si cerro tu sesion, te
            llevamos de regreso a esta pantalla.
          </p>
        </form>
      </div>
    </main>
  );
}

function SuspenseFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-base font-semibold text-slate-800">Cargando login...</p>
        <p className="text-sm text-slate-600">Preparando los parametros de la URL.</p>
      </div>
    </main>
  );
}
