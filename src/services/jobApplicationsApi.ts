// HTTP client for job applications API built on the shared fetch helper.

import { apiFetch, API_URL } from '../lib/apiClient';
import { JobApplication, JobStatus } from '../types/jobApplication';
import { JobApplicationHistoryEntry } from '../types/jobApplicationHistory';

export type JobApplicationsQuery = {
  status?: JobStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  q?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedJobApplicationsResponse = {
  items: JobApplication[];
  meta: PaginationMeta;
};

export type SalaryCurrency = 'ARS' | 'USD' | 'EUR';
export type SalaryPeriod = 'Mensual' | 'Anual' | 'Hora';
export type SalaryType = 'Bruto' | 'Neto';

export type CreateJobApplicationPayload = {
  company: string;
  position: string;
  source: string;
  applicationDate: string;
  status: JobStatus;
  notes?: string;
  jobUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: SalaryCurrency;
  salaryPeriod?: SalaryPeriod;
  salaryType?: SalaryType;
};

export async function getJobApplications(
  filters?: JobApplicationsQuery,
): Promise<PaginatedJobApplicationsResponse> {
  const url = new URL('/job-applications', API_URL);
  if (filters?.status) url.searchParams.set('status', filters.status);
  if (filters?.fromDate) url.searchParams.set('fromDate', filters.fromDate);
  if (filters?.toDate) url.searchParams.set('toDate', filters.toDate);
  if (filters?.page) url.searchParams.set('page', filters.page.toString());
  if (filters?.limit) url.searchParams.set('limit', filters.limit.toString());
  if (filters?.q) url.searchParams.set('q', filters.q);

  return apiFetch<PaginatedJobApplicationsResponse>(url.toString());
}

export async function createJobApplication(
  payload: CreateJobApplicationPayload,
): Promise<JobApplication> {
  return apiFetch<JobApplication>('/job-applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getJobApplication(id: string): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`);
}

export async function getJobApplicationHistory(
  id: string,
): Promise<JobApplicationHistoryEntry[]> {
  return apiFetch<JobApplicationHistoryEntry[]>(`/job-applications/${id}/history`);
}

export async function updateJobApplicationStatus(
  id: string,
  status: JobStatus,
): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export type UpdateJobApplicationPayload = Partial<{
  company: string;
  position: string;
  source: string;
  applicationDate: string;
  status: JobStatus;
  notes: string | null;
  jobUrl: string | null;
}>;

export async function updateJobApplication(
  id: string,
  payload: UpdateJobApplicationPayload,
): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteJobApplication(id: string): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`, { method: 'DELETE' });
}
