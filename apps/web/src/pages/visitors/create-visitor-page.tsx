import * as React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreateVisitor, useUpdateVisitor, useVisitor } from '@/hooks/use-visitors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import type { Visitor } from '@/types';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export function CreateVisitorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const createVisitor = useCreateVisitor();
  const updateVisitor = useUpdateVisitor(id || '');
  const { data: existing } = useVisitor(id || '');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<{
    name: string;
    documentType: string;
    documentNumber: string;
    phone: string;
    email: string;
    vehiclePlate: string;
    propertyId: string;
    type: string;
    notes: string;
  }>({
    name: '',
    documentType: 'dni',
    documentNumber: '',
    phone: '',
    email: '',
    vehiclePlate: '',
    propertyId: '',
    type: 'guest',
    notes: '',
  });

  React.useEffect(() => {
    if (isEdit && existing?.data) {
      const v = existing.data;
      setForm({
        name: v.name,
        documentType: v.documentType,
        documentNumber: v.documentNumber,
        phone: v.phone || '',
        email: v.email || '',
        vehiclePlate: v.vehiclePlate || '',
        propertyId: v.propertyId || '',
        type: v.type,
        notes: v.notes || '',
      });
    }
  }, [isEdit, existing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateVisitor.mutateAsync(form as unknown as Partial<Visitor>);
        toast({ title: 'Visitante actualizado' });
      } else {
        await createVisitor.mutateAsync(form as unknown as Partial<Visitor>);
        toast({ title: 'Visitante creado' });
      }
      navigate('/visitors');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Operación fallida',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/visitors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? 'Editar Visitante' : 'Nuevo Visitante'}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar información del visitante' : 'Detalles del visitante'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Actualiza la información del visitante a continuación.' : 'Ingresa la información del visitante a continuación.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de documento</Label>
                <Select
                  value={form.documentType}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, documentType: v }))}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="passport">Pasaporte</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número de documento *</Label>
                <Input id="documentNumber" name="documentNumber" value={form.documentNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de visitante</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Invitado</SelectItem>
                    <SelectItem value="family">Familiar</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="service">Servicio</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Patente / Placa</Label>
                <Input id="vehiclePlate" name="vehiclePlate" value={form.vehiclePlate} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId">ID de propiedad</Label>
              <Input id="propertyId" name="propertyId" value={form.propertyId} onChange={handleChange} placeholder="Dejar vacío si no aplica" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> {isEdit ? 'Actualizar' : 'Crear'}</>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/visitors">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
