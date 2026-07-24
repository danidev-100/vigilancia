import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchResult } from '@/types';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () =>
      api.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}
