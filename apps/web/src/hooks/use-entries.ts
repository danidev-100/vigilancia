import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Entry } from '@/types';

export function useEntries(params?: {
  search?: string;
  status?: string;
  propertyId?: string;
  personType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.propertyId) query.set('propertyId', params.propertyId);
  if (params?.personType) query.set('personType', params.personType);
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  const qs = query.toString();

  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => api.get<Entry[]>(`/entries${qs ? `?${qs}` : ''}`),
  });
}

export function useActiveEntries() {
  return useQuery({
    queryKey: ['entries', 'active'],
    queryFn: () => api.get<Entry[]>('/entries/active'),
    refetchInterval: 30_000,
  });
}

export function useRegisterEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      personType: string;
      personId: string;
      vehiclePlate?: string;
      notes?: string;
      authorizationMethod?: string;
    }) => api.post<Entry>('/entries', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRegisterExit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Entry>(`/entries/${id}/exit`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
