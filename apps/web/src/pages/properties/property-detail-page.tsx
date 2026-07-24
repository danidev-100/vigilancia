import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '@/hooks/use-properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  Users,
  Briefcase,
  HardHat,
  UserCheck,
} from 'lucide-react';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: res, isLoading } = useProperty(id!);
  const property = res?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <Building2 className="mb-3 h-16 w-16 opacity-30" />
        <h2 className="text-xl font-medium">Propiedad no encontrada</h2>
        <Button variant="link" asChild className="mt-2">
          <Link to="/properties">Volver a propiedades</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/properties">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
        <Badge variant={property.status === 'active' ? 'success' : 'secondary'} className="ml-auto">
          {property.status}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="text-sm font-medium">{property.address}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Building2 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-medium capitalize">{property.type}</p>
            </div>
          </CardContent>
        </Card>
        {property.phone && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">{property.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="residents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="residents">
            <Users className="mr-2 h-4 w-4" /> Residentes
          </TabsTrigger>
          <TabsTrigger value="visitors">
            <UserCheck className="mr-2 h-4 w-4" /> Visitantes
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Briefcase className="mr-2 h-4 w-4" /> Empleados
          </TabsTrigger>
          <TabsTrigger value="contractors">
            <HardHat className="mr-2 h-4 w-4" /> Contratistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="residents">
          <Card>
            <CardHeader>
              <CardTitle>Residentes</CardTitle>
            </CardHeader>
            <CardContent>
              {property.residents && property.residents.length > 0 ? (
                <div className="space-y-3">
                  {property.residents.map((resident: any) => (
                    <div key={resident.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium">
                          {resident.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{resident.name}</p>
                        <p className="text-xs text-muted-foreground">{resident.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Users className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Sin residentes asignados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <UserCheck className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">El historial de visitantes aparecerá aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Briefcase className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Sin empleados asignados a esta propiedad</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contractors">
          <Card>
            <CardHeader>
              <CardTitle>Contratistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <HardHat className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Sin contratistas asignados a esta propiedad</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
