import * as React from 'react';
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
  Car,
  Search,
  Plus,
  Loader2,
  Truck,
  Bike,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Vehicle } from '@/types';

export function VehiclesPage() {
  const [search, setSearch] = React.useState('');
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['vehicles', search],
    queryFn: () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      return api.get<Vehicle[]>(`/vehicles${qs}`);
    },
  });
  const vehicles = res?.data ?? [];

  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    plate: '',
    brand: '',
    model: '',
    color: '',
    type: 'car',
    ownerName: '',
    ownerType: 'resident',
    propertyId: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/vehicles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      setShowForm(false);
      setForm({ plate: '', brand: '', model: '', color: '', type: 'car', ownerName: '', ownerType: 'resident', propertyId: '' });
      toast({ title: 'Vehículo registrado' });
    },
    onError: (err) =>       toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al registrar', variant: 'destructive' }),
  });

  const typeIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'motorcycle': return <Bike className="h-4 w-4" />;
      case 'truck': return <Truck className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Registrar Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Vehículo</DialogTitle>
              <DialogDescription>Ingresa los detalles del vehículo a continuación.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate">Patente *</Label>
                  <Input id="plate" value={form.plate} onChange={(e) => setForm(p => ({ ...p, plate: e.target.value }))} placeholder="ABC-123" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Auto</SelectItem>
                      <SelectItem value="motorcycle">Moto</SelectItem>
                      <SelectItem value="truck">Camión</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" value={form.brand} onChange={(e) => setForm(p => ({ ...p, brand: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" value={form.model} onChange={(e) => setForm(p => ({ ...p, model: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" value={form.color} onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerType">Tipo de propietario</Label>
                  <Select value={form.ownerType} onValueChange={(v) => setForm(p => ({ ...p, ownerType: v }))}>
                    <SelectTrigger id="ownerType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Residente</SelectItem>
                      <SelectItem value="visitor">Visitante</SelectItem>
                      <SelectItem value="employee">Empleado</SelectItem>
                      <SelectItem value="contractor">Contratista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nombre del propietario</Label>
                <Input id="ownerName" value={form.ownerName} onChange={(e) => setForm(p => ({ ...p, ownerName: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.plate || createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Registro de Vehículos</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por patente, marca, modelo..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Car className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No hay vehículos registrados</p>
              <p className="text-sm">Registra tu primer vehículo para empezar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patente</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v: Vehicle) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium uppercase">{v.plate}</TableCell>
                    <TableCell>{v.brand} {v.model}</TableCell>
                    <TableCell>{v.color}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {typeIcon(v.type)}
                        <span className="capitalize">{v.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.ownerName}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'active' ? 'success' : 'secondary'}>
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
