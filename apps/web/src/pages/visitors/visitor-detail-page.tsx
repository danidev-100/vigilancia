import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVisitor } from '@/hooks/use-visitors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  FileText,
  Phone,
  Mail,
  Car,
  Calendar,
  Shield,
} from 'lucide-react';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: res, isLoading } = useVisitor(id!);
  const visitor = res?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <User className="mb-3 h-16 w-16 opacity-30" />
        <h2 className="text-xl font-medium">Visitante no encontrado</h2>
        <Button variant="link" asChild className="mt-2">
          <Link to="/visitors">Volver a visitantes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/visitors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{visitor.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{visitor.type}</p>
        </div>
        <Badge
          variant={
            visitor.status === 'active'
              ? 'success'
              : visitor.status === 'blacklisted'
                ? 'destructive'
                : 'secondary'
          }
        >
          {visitor.status}
        </Badge>
        <Button variant="outline" asChild>
          <Link to={`/visitors/${visitor.id}/edit`}>Editar</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Documento</p>
                <p className="text-sm font-medium">
                  {visitor.documentType.toUpperCase()} {visitor.documentNumber}
                </p>
              </div>
            </div>
            {visitor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{visitor.phone}</p>
                </div>
              </div>
            )}
            {visitor.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm font-medium">{visitor.email}</p>
                </div>
              </div>
            )}
            {visitor.vehiclePlate && (
              <div className="flex items-center gap-3">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="text-sm font-medium">{visitor.vehiclePlate}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Registrado</p>
                <p className="text-sm font-medium">
                  {new Date(visitor.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {visitor.authorizedUntil && (
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Autorizado hasta</p>
                  <p className="text-sm font-medium">
                    {new Date(visitor.authorizedUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            {visitor.property ? (
              <div className="space-y-2">
                <p className="font-medium">{visitor.property.name}</p>
                <p className="text-sm text-muted-foreground">{visitor.property.address}</p>
                <Button variant="link" className="h-auto p-0" asChild>
                  <Link to={`/properties/${visitor.propertyId}`}>Ver propiedad</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin propiedad asignada</p>
            )}
          </CardContent>
        </Card>

        {visitor.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{visitor.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historial de Accesos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Calendar className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">El historial de accesos aparecerá aquí</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
