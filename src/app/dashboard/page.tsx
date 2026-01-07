'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { DashboardHero } from '../../components/layout/DashboardHero';
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
      <main className="flex min-h-screen items-center justify-center bg-bg">
        <div className="rounded-card border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-ink">Verificando sesion...</p>
          <p className="text-xs text-ink-muted">Validamos tu sesion para evitar parpadeos.</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="max-w-md space-y-4 rounded-card border border-border bg-surface p-6 text-center">
          <p className="text-lg font-semibold text-ink">Sesion no disponible</p>
          <p className="text-sm text-ink-muted">
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
    <main className="min-h-screen bg-bg">
      <DashboardHeader userEmail={userEmail} onLogout={onLogout} loggingOut={loggingOut} />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        <DashboardHero
          eyebrow="Progreso en tu busqueda"
          title="Dashboard de postulaciones"
          subtitle="Registra tus aplicaciones, monitorea avances y celebra cada paso adelante. Aqui ves tu esfuerzo transformado en progreso concreto."
        />

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
