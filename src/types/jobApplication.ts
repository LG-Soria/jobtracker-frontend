// Specification: Types for job applications shared in the frontend.
// Defines JobStatus and JobApplication aligned with backend API payloads.

export enum JobStatus {
  ENVIADA = 'ENVIADA',
  EN_PROCESO = 'EN_PROCESO',
  ENTREVISTA = 'ENTREVISTA',
  RECHAZADA = 'RECHAZADA',
  SIN_RESPUESTA = 'SIN_RESPUESTA',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.ENVIADA]: 'Enviada',
  [JobStatus.EN_PROCESO]: 'En proceso',
  [JobStatus.ENTREVISTA]: 'Entrevista',
  [JobStatus.RECHAZADA]: 'Rechazada',
  [JobStatus.SIN_RESPUESTA]: 'Sin respuesta',
};

export const getJobStatusLabel = (status: JobStatus) => JOB_STATUS_LABELS[status] ?? status;

export type SalaryCurrency = 'ARS' | 'USD' | 'EUR';
export type SalaryPeriod = 'Mensual' | 'Anual' | 'Hora';
export type SalaryType = 'Bruto' | 'Neto';

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  source: string;
  applicationDate: string;
  status: JobStatus;
  notes?: string | null;
  jobUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: SalaryCurrency | null;
  salaryPeriod?: SalaryPeriod | null;
  salaryType?: SalaryType | null;
  createdAt: string;
  updatedAt: string;
};
