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
      <main className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
          <p className="text-base font-semibold text-ink">Verificando sesion...</p>
          <p className="text-sm text-ink-muted">Comprobamos tu cookie para evitar parpadeos.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center bg-bg px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-10 rounded-card border border-border bg-surface p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              JobTracker
            </p>
            <h1 className="text-[1.75rem] font-semibold text-ink">Inicia sesion para seguir tu busqueda</h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              Usamos cookies httpOnly. No guardamos tokens en el navegador, solo verificamos tu
              sesion contra el backend.
            </p>
          </div>

          <div className="space-y-3 rounded-card border border-border bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                  Credenciales demo
                </p>
                <p className="text-sm text-ink">
                  Usa este usuario para probar el flujo completo.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-border bg-surface text-ink hover:bg-surface-muted"
                type="button"
                onClick={handleAutofill}
              >
                Autocompletar demo
              </Button>
            </div>
            <div className="space-y-2 rounded-card border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Email</span>
                <span className="font-semibold text-ink">{DEMO_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Password</span>
                <span className="font-semibold text-ink">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-card border border-border bg-surface p-6"
        >
          <div className="space-y-1">
            <h2 className="text-[1.5rem] font-semibold text-ink">Iniciar sesion</h2>
            <p className="text-sm text-ink-muted">
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
            <div className="rounded-card border border-danger/50 bg-danger-soft px-3 py-2 text-sm text-primary">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
          </Button>

          <p className="text-xs text-ink-soft">
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
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <p className="text-base font-semibold text-ink">Cargando login...</p>
        <p className="text-sm text-ink-muted">Preparando los parametros de la URL.</p>
      </div>
    </main>
  );
}
