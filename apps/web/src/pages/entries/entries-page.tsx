import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useRegisterEntry } from '@/hooks/use-entries';
import { api } from '@/lib/api';
import {
  LogIn,
  Search,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { Visitor, Employee, Contractor } from '@/types';

type SearchResult = {
  type: 'visitor' | 'employee' | 'contractor' | 'resident';
  data: Visitor | Employee | Contractor;
};

function getPersonName(person: Visitor | Employee | Contractor): string {
  if ('name' in person) return (person as Visitor | Employee).name;
  return (person as Contractor).responsibleName;
}

function getPersonDocument(person: Visitor | Employee | Contractor): string {
  if ('documentNumber' in person) {
    const p = person as Visitor | Employee | Contractor;
    return `${(p.documentType || '').toUpperCase()} ${p.documentNumber}`;
  }
  return '';
}

export function EntriesPage() {
  const [query, setQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState<SearchResult | null>(null);
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const registerEntry = useRegisterEntry();

  const handleSearch = async () => {
    if (!query || query.length < 2) return;
    setIsSearching(true);
    setSelectedPerson(null);
    try {
      const res = await api.get<{
        visitors: Visitor[];
        employees: Employee[];
        contractors: Contractor[];
      }>(`/search/entry-candidates?q=${encodeURIComponent(query)}`);

      const results: SearchResult[] = [];
      if (res.data) {
        res.data.visitors?.forEach((v: Visitor) => results.push({ type: 'visitor', data: v }));
        res.data.employees?.forEach((e: Employee) => results.push({ type: 'employee', data: e }));
        res.data.contractors?.forEach((c: Contractor) => results.push({ type: 'contractor', data: c }));
      }
      setSearchResults(results);
    } catch (err) {
      toast({
        title: 'Búsqueda fallida',
        description: err instanceof Error ? err.message : 'No se pudo buscar',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterEntry = async () => {
    if (!selectedPerson) return;
    try {
      await registerEntry.mutateAsync({
        personType: selectedPerson.type,
        personId: selectedPerson.data.id,
        vehiclePlate: vehiclePlate || undefined,
        notes: notes || undefined,
        authorizationMethod: 'manual',
      });
      toast({
        title: 'Ingreso registrado',
        description: `${getPersonName(selectedPerson.data)} ha sido registrado como ingreso`,
        variant: 'success',
      });
      setSelectedPerson(null);
      setQuery('');
      setSearchResults([]);
      setVehiclePlate('');
      setNotes('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo registrar el ingreso',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Control de Acceso</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/entries/active">Accesos Activos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/entries/history">Historial</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrar Ingreso</CardTitle>
            <CardDescription>
              Buscar por nombre, número de documento, código QR o patente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nombre, documento, patente..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || query.length < 2}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && !selectedPerson && (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.data.id}`}
                    onClick={() => setSelectedPerson(result)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getPersonName(result.data)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getPersonDocument(result.data) || result.type}
                        {' '}&middot;{' '}
                        <Badge variant="info" className="text-[10px]">{result.type}</Badge>
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!isSearching && query.length >= 2 && searchResults.length === 0 && !selectedPerson && (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <XCircle className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No se encontraron registros coincidentes</p>
              </div>
            )}

            {/* Selected Person */}
            {selectedPerson && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-500/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                      <p className="font-medium">{getPersonName(selectedPerson.data)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getPersonDocument(selectedPerson.data)}
                      {' '}&middot;{' '}
                      <Badge variant="info" className="text-[10px]">{selectedPerson.type}</Badge>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPerson(null)}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Ingreso</CardTitle>
            <CardDescription>Completa el registro de ingreso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPerson ? (
              <>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-500">Autorizado</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedPerson.type === 'visitor'
                          ? 'Visitante pre-registrado'
                          : selectedPerson.type === 'employee'
                            ? 'Empleado registrado'
                            : 'Contratista activo'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Patente (opcional)</Label>
                  <Input
                    id="vehicle"
                    placeholder="ABC-123"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <textarea
                    id="notes"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRegisterEntry}
                  disabled={registerEntry.isPending}
                >
                  {registerEntry.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                  ) : (
                    <><LogIn className="mr-2 h-4 w-4" /> Registrar Ingreso</>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <User className="mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm text-center">Busca una persona para registrar su ingreso</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
