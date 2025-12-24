import { DetallePostulacionModal } from '../../../../components/job-applications/DetallePostulacionModal';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return <DetallePostulacionModal applicationId={params.id} />;
}
