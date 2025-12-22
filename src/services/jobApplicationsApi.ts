// HTTP client for job applications API built on the shared fetch helper.

import { apiFetch, API_URL } from '../lib/apiClient';
import { JobApplication, JobStatus } from '../types/jobApplication';

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

export type CreateJobApplicationPayload = {
  company: string;
  position: string;
  source: string;
  applicationDate: string;
  status: JobStatus;
  notes?: string;
  jobUrl?: string;
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

export async function updateJobApplicationStatus(
  id: string,
  status: JobStatus,
): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteJobApplication(id: string): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/job-applications/${id}`, { method: 'DELETE' });
}
