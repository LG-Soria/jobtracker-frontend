import { DetallePostulacionModal } from '../../../../components/job-applications/DetallePostulacionModal';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetallePostulacionModal applicationId={id} />;
}
