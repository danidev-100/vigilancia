import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Visitor } from '@/types';

export function useVisitors(params?: {
  search?: string;
  status?: string;
  type?: string;
  propertyId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.type) query.set('type', params.type);
  if (params?.propertyId) query.set('propertyId', params.propertyId);
  const qs = query.toString();

  return useQuery({
    queryKey: ['visitors', params],
    queryFn: () => api.get<Visitor[]>(`/visitors${qs ? `?${qs}` : ''}`),
  });
}

export function useVisitor(id: string) {
  return useQuery({
    queryKey: ['visitor', id],
    queryFn: () => api.get<Visitor>(`/visitors/${id}`),
    enabled: !!id,
  });
}

export function useCreateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Visitor>) => api.post('/visitors', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  });
}

export function useUpdateVisitor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Visitor>) => api.put(`/visitors/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors'] });
      qc.invalidateQueries({ queryKey: ['visitor', id] });
    },
  });
}

export function useDeleteVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/visitors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  });
}

export function useValidateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { documentNumber: string; documentType: string }) =>
      api.post<Visitor>('/visitors/validate', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  });
}
