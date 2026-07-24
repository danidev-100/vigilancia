import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/components/ui/use-toast';
import { useActiveEntries, useRegisterExit } from '@/hooks/use-entries';
import { LogOut, LogIn, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import type { Entry } from '@/types';

export function ActiveEntriesPage() {
  const { data: res, isLoading, refetch } = useActiveEntries();
  const registerExit = useRegisterExit();
  const entries = res?.data ?? [];

  const handleExit = async (entryId: string, personName: string) => {
    try {
      await registerExit.mutateAsync(entryId);
      toast({
        title: 'Salida registrada',
        description: `${personName} ha sido registrado como salida`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo registrar la salida',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/entries">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Accesos Activos</h1>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Actualmente Adentro</CardTitle>
            <Badge variant="success">{entries.length} activos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <LogIn className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Sin accesos activos</p>
              <p className="text-sm">No hay personas dentro del barrio actualmente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Ingresó</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: Entry) => {
                  const duration = Math.floor(
                    (Date.now() - new Date(entry.timestamp).getTime()) / 60000,
                  );
                  const hours = Math.floor(duration / 60);
                  const mins = duration % 60;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.personName}</TableCell>
                      <TableCell>
                        <Badge variant="info" className="capitalize">{entry.personType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.personDocument}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {hours > 0 ? `${hours}h ` : ''}{mins}m
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.vehiclePlate || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleExit(entry.id, entry.personName)}
                          disabled={registerExit.isPending}
                        >
                          <LogOut className="mr-1 h-3 w-3" /> Registrar Salida
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
