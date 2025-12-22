'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FormularioPostulacion } from '../../components/job-applications/FormularioPostulacion';
import { ListadoPostulaciones } from '../../components/job-applications/ListadoPostulaciones';
import { MetricsSection } from '../../components/job-applications/MetricsSection';
import { useAuth } from '../../contexts/AuthContext';
import { useJobApplications } from '../../hooks/useJobApplications';

export default function DashboardPage() {
  const { isLoadingSession, isAuthenticated, user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (isLoadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Verificando sesion...</p>
          <p className="text-xs text-slate-500">Validamos tu sesion para evitar parpadeos.</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">Sesion no disponible</p>
          <p className="text-sm text-slate-600">
            Tu sesion expiro o no iniciaste sesion todavia. Volve a ingresar para ver tu panel.
          </p>
          <Button asChild>
            <Link href="/login">Ir a login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <DashboardContent
      userEmail={user?.email ?? ''}
      onLogout={async () => {
        setLoggingOut(true);
        try {
          await logout();
        } finally {
          setLoggingOut(false);
        }
      }}
      loggingOut={loggingOut}
    />
  );
}

function DashboardContent({
  userEmail,
  onLogout,
  loggingOut,
}: {
  userEmail: string;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}) {
  const {
    applications,
    loading,
    error,
    create,
    updateStatus,
    remove,
    filters,
    reload,
    formSuccess,
    listSuccess,
    suggestionOptions,
    pagination,
    search,
    metrics,
    metricsLoading,
  } = useJobApplications();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <header className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progreso en tu busqueda</p>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de postulaciones</h1>
              <p className="text-sm text-slate-600">
                Registra tus aplicaciones, monitorea avances y celebra cada paso adelante. Aqui ves
                tu esfuerzo transformado en progreso concreto.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sesion activa
                </p>
                <p className="text-sm font-semibold text-slate-800">{userEmail}</p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => void onLogout()}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Saliendo...' : 'Cerrar sesion'}
              </Button>
            </div>
          </div>
        </header>

        <MetricsSection metrics={metrics} loading={metricsLoading} />

        <FormularioPostulacion
          onSubmit={create}
          loading={loading}
          error={error}
          success={formSuccess}
          suggestions={suggestionOptions}
        />

        <ListadoPostulaciones
          applications={applications}
          loading={loading}
          error={error}
          filters={filters}
          pagination={pagination}
          search={search}
          onChangeStatus={updateStatus}
          onDelete={remove}
          onRetry={reload}
          success={listSuccess}
        />
      </div>
    </main>
  );
}
