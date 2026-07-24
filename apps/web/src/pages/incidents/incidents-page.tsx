import * as React from 'react';
import { useIncidents, useCreateIncident, useUpdateIncident } from '@/hooks/use-incidents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Search,
  Plus,
  Loader2,
  Filter,
  Clock,
} from 'lucide-react';
import type { Incident } from '@/types';

const severityConfig = {
  low: { variant: 'secondary' as const, label: 'Bajo' },
  medium: { variant: 'info' as const, label: 'Medio' },
  high: { variant: 'warning' as const, label: 'Alto' },
  critical: { variant: 'destructive' as const, label: 'Crítico' },
};

const statusConfig = {
  reported: { variant: 'warning' as const, label: 'Reportado' },
  investigating: { variant: 'info' as const, label: 'Investigando' },
  resolved: { variant: 'success' as const, label: 'Resuelto' },
  dismissed: { variant: 'secondary' as const, label: 'Descartado' },
};

export function IncidentsPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState('');
  const { data: res, isLoading } = useIncidents({
    search,
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });
  const incidents = res?.data ?? [];

  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<{
    title: string;
    description: string;
    type: string;
    severity: string;
    location: string;
    propertyId: string;
  }>({
    title: '',
    description: '',
    type: 'security',
    severity: 'medium',
    location: '',
    propertyId: '',
  });

  const createIncident = useCreateIncident();

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      toast({ title: 'Error', description: 'El título y la descripción son obligatorios', variant: 'destructive' });
      return;
    }
    try {
      await createIncident.mutateAsync(form as unknown as Partial<Incident>);
      toast({ title: 'Incidente reportado', variant: 'success' });
      setShowForm(false);
      setForm({ title: '', description: '', type: 'security', severity: 'medium', location: '', propertyId: '' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al reportar',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Reportar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Reportar Incidente</DialogTitle>
              <DialogDescription>Describe los detalles del incidente a continuación.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Seguridad</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="noise">Ruido</SelectItem>
                      <SelectItem value="suspicious">Sospechoso</SelectItem>
                      <SelectItem value="accident">Accidente</SelectItem>
                      <SelectItem value="fire">Incendio</SelectItem>
                      <SelectItem value="theft">Robo</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severidad</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Ej: Portón principal, Calle 5" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createIncident.isPending}>
                {createIncident.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reportando...</> : 'Reportar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Todos los Incidentes</CardTitle>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar incidentes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos los estados</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todas las severidades</SelectItem>
                {Object.entries(severityConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <AlertTriangle className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No hay incidentes reportados</p>
              <p className="text-sm">¡Todo en orden! No hay incidentes para mostrar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident: Incident) => {
                const sv = severityConfig[incident.severity as keyof typeof severityConfig] || severityConfig.medium;
                const st = statusConfig[incident.status as keyof typeof statusConfig] || statusConfig.reported;
                return (
                  <div key={incident.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{incident.title}</h3>
                          <Badge variant={sv.variant} className="text-[10px] uppercase">{sv.label}</Badge>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="capitalize">{incident.type}</span>
                          {incident.location && <span>&middot; {incident.location}</span>}
                          <span>&middot; <Clock className="mr-1 inline h-3 w-3" />
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
