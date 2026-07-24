import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEntries } from '@/hooks/use-entries';
import { ArrowLeft, Search, LogIn, LogOut, Calendar } from 'lucide-react';
import type { Entry } from '@/types';

export function EntryHistoryPage() {
  const [search, setSearch] = React.useState('');
  const [personType, setPersonType] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { data: res, isLoading } = useEntries({
    search,
    personType: personType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const entries = res?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/entries">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Accesos</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Registro de Ingresos y Salidas</CardTitle>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, documento..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={personType} onValueChange={setPersonType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos los tipos</SelectItem>
                <SelectItem value="visitor">Visitante</SelectItem>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="contractor">Contratista</SelectItem>
                <SelectItem value="resident">Residente</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[150px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              className="w-[150px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Calendar className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No se encontraron accesos</p>
              <p className="text-sm">Prueba ajustando la búsqueda o los filtros de fecha.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: Entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.personName}</TableCell>
                    <TableCell>
                      <Badge variant="info" className="capitalize">{entry.personType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.entryType === 'entry' ? 'success' : 'warning'}
                      >
                        <span className="flex items-center gap-1">
                          {entry.entryType === 'entry' ? (
                            <><LogIn className="h-3 w-3" /> Ingreso</>
                          ) : (
                            <><LogOut className="h-3 w-3" /> Salida</>
                          )}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.exitTimestamp
                        ? new Date(entry.exitTimestamp).toLocaleString()
                        : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.vehiclePlate || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {entry.authorizationMethod}
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
