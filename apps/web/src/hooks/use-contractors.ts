import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Contractor } from '@/types';

export function useContractors(params?: {
  search?: string;
  status?: string;
  propertyId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.propertyId) query.set('propertyId', params.propertyId);
  const qs = query.toString();

  return useQuery({
    queryKey: ['contractors', params],
    queryFn: () => api.get<Contractor[]>(`/contractors${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateContractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Contractor>) => api.post('/contractors', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractors'] }),
  });
}

export function useUpdateContractor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Contractor>) =>
      api.put(`/contractors/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractors'] }),
  });
}

export function useDeleteContractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/contractors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractors'] }),
  });
}
