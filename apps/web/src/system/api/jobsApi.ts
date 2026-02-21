import { useApi, useApiMutation } from './useApi';
import { apiClient } from './apiClient';

export interface JobDTO {
  id: number;
  clientId: number;
  title: string;
  description: string;
  type: 'flash' | 'sprint' | 'anchor';
  budgetMin: number;
  budgetMax: number;
  status: 'draft' | 'active' | 'claimed' | 'completed' | 'cancelled';
  requiredSkills?: string[];
  estimatedDuration?: number;
  claimedBy?: number;
  claimedAt?: string;
  deliverablesRequired?: string[];
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  type: 'flash' | 'sprint' | 'anchor';
  estimated_duration?: number;
  required_skills?: string[];
  deliverables_required?: string[];
}

export function useGetDiscoveryFeed(cursor?: string) {
  return useApi<{
    data: JobDTO[];
    pagination: { hasMore: boolean; nextCursor?: number };
  }>(
    ['discovery', cursor],
    `/api/jobs/discovery${cursor ? `?cursor=${cursor}` : ''}`
  );
}

export function useClaimJob() {
  return useApiMutation<{ data: JobDTO }, { jobId: number }>(
    '/api/jobs/{jobId}/claim',
    'post'
  );
}

export function usePostJob() {
  return useApiMutation<JobDTO, CreateJobPayload>('/api/jobs', 'post');
}

export function useGetMyJobs(type: 'posted' | 'claimed' = 'posted', status?: string) {
  return useApi<JobDTO[]>(
    ['my-jobs', type, status],
    `/api/jobs/my?type=${type}${status ? `&status=${status}` : ''}`
  );
}

export async function getDiscoveryFeed(cursor?: string) {
  const response = await apiClient.get<{
    data: JobDTO[];
    pagination: { hasMore: boolean; nextCursor?: number };
  }>('/api/jobs/discovery', {
    params: { cursor },
  });
  return response.data;
}

export async function claimJob(jobId: number) {
  const response = await apiClient.post<{ data: JobDTO }>(
    `/api/jobs/${jobId}/claim`
  );
  return response.data.data;
}

export async function postJob(payload: CreateJobPayload) {
  const response = await apiClient.post<{ data: JobDTO }>('/api/jobs', payload);
  return response.data.data;
}

export async function getMyJobs(type: 'posted' | 'claimed' = 'posted', status?: string) {
  const response = await apiClient.get<{ data: JobDTO[] }>('/api/jobs/my', {
    params: { type, status },
  });
  return response.data.data;
}
