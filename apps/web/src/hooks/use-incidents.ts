import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Incident } from '@/types';

export function useIncidents(params?: {
  search?: string;
  status?: string;
  severity?: string;
  type?: string;
  propertyId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.type) query.set('type', params.type);
  if (params?.propertyId) query.set('propertyId', params.propertyId);
  const qs = query.toString();

  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => api.get<Incident[]>(`/incidents${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Incident>) => api.post('/incidents', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateIncident(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Incident>) =>
      api.put(`/incidents/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
