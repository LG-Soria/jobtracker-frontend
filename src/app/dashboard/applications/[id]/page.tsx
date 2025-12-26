import { DetallePostulacionModal } from '../../../../features/job-applications/detail/components/ApplicationDetailModal';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetallePostulacionModal applicationId={id} />;
}
