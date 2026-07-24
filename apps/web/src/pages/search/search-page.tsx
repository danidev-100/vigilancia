import * as React from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/hooks/use-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search as SearchIcon,
  User,
  Building2,
  Briefcase,
  HardHat,
  Car,
  AlertTriangle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import type { SearchResult } from '@/types';

const typeConfig = {
  visitor: { icon: User, label: 'Visitante', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  employee: { icon: Briefcase, label: 'Empleado', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  contractor: { icon: HardHat, label: 'Contratista', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  property: { icon: Building2, label: 'Propiedad', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  vehicle: { icon: Car, label: 'Vehículo', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  incident: { icon: AlertTriangle, label: 'Incidente', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function SearchPage() {
  const [query, setQuery] = React.useState('');
  const { data: res, isLoading } = useSearch(query);
  const results = res?.data ?? [];
  const hasSearched = query.length >= 2;

  const grouped = results.reduce(
    (acc, result) => {
      const group = result.type;
      if (!acc[group]) acc[group] = [];
      acc[group].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Búsqueda</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Búsqueda Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar visitantes, empleados, contratistas, propiedades, vehículos, incidentes..."
              className="h-12 pl-10 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <FileText className="mb-3 h-16 w-16 opacity-30" />
          <h2 className="text-xl font-medium">Sin resultados</h2>
          <p className="text-sm">Prueba con otro término de búsqueda.</p>
        </div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => {
            const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.visitor;
            const Icon = config.icon;
            return (
              <div key={type}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={`rounded-lg p-1.5 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <h2 className="text-lg font-semibold capitalize">{config.label}s</h2>
                  <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.link}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{result.title}</p>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasSearched && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <SearchIcon className="mb-3 h-16 w-16 opacity-20" />
          <h2 className="text-xl font-medium">Escribe para buscar</h2>
          <p className="text-sm">Busca en todos los módulos del sistema.</p>
        </div>
      )}
    </div>
  );
}
