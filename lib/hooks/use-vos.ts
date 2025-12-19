import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VOStatus, SubmissionType } from '@/lib/validations/vo';

export interface VO {
  id: number;
  subject: string;
  submissionType: SubmissionType;
  submissionReference: string | null;
  responseReference: string | null;
  submissionDate: string;
  assessmentValue: number | null;
  proposalValue: number | null;
  approvedAmount: number | null;
  status: VOStatus;
  vorReference: string | null;
  dvoReference: string | null;
  dvoIssuedDate: string | null;
  remarks: string | null;
  actionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VOListResponse {
  data: VO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface VOQueryParams {
  search?: string;
  status?: VOStatus;
  submissionType?: SubmissionType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

async function fetchVOs(params: VOQueryParams): Promise<VOListResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`/api/vo?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch VOs');
  }
  return response.json();
}

async function fetchVO(id: number): Promise<VO> {
  const response = await fetch(`/api/vo/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch VO');
  }
  const json = await response.json();
  return json.data;
}

async function createVO(data: Partial<VO>): Promise<VO> {
  const response = await fetch('/api/vo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create VO');
  }
  const json = await response.json();
  return json.data;
}

async function updateVO({ id, data }: { id: number; data: Partial<VO> }): Promise<VO> {
  const response = await fetch(`/api/vo/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update VO');
  }
  const json = await response.json();
  return json.data;
}

async function deleteVO(id: number): Promise<void> {
  const response = await fetch(`/api/vo/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete VO');
  }
}

export function useVOs(params: VOQueryParams = {}) {
  return useQuery({
    queryKey: ['vos', params],
    queryFn: () => fetchVOs(params),
  });
}

export function useVO(id: number) {
  return useQuery({
    queryKey: ['vo', id],
    queryFn: () => fetchVO(id),
    enabled: !!id,
  });
}

export function useCreateVO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vos'] });
      queryClient.invalidateQueries({ queryKey: ['vo-stats'] });
    },
  });
}

export function useUpdateVO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVO,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vos'] });
      queryClient.invalidateQueries({ queryKey: ['vo', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vo-stats'] });
    },
  });
}

export function useDeleteVO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vos'] });
      queryClient.invalidateQueries({ queryKey: ['vo-stats'] });
    },
  });
}
