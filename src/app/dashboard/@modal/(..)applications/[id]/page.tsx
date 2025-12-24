import { DetallePostulacionModal } from '../../../../../components/job-applications/DetallePostulacionModal';

export default function ApplicationModalPage({ params }: { params: { id: string } }) {
  return <DetallePostulacionModal applicationId={params.id} />;
}
