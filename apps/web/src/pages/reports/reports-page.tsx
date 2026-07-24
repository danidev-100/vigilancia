import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import {
  FileText,
  Download,
  BarChart3,
  Users,
  LogIn,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

const reports = [
  {
    id: 'entries',
    title: 'Reporte de Ingresos/Salidas',
    description: 'Registro detallado de todos los ingresos y salidas en un rango de fechas',
    icon: LogIn,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'visitors',
    title: 'Reporte de Visitantes',
    description: 'Todos los registros de visitantes y resumen de actividad',
    icon: Users,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'incidents',
    title: 'Reporte de Incidentes',
    description: 'Todos los incidentes reportados con estado y resolución',
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    id: 'general',
    title: 'Estadísticas Generales',
    description: 'Estadísticas generales de seguridad del barrio y tendencias',
    icon: BarChart3,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
];

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState('entries');
  const [format, setFormat] = React.useState('csv');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.set('startDate', startDate);
      if (endDate) query.set('endDate', endDate);
      query.set('format', format);

      const res = await fetch(`/api/reports/${selectedReport}?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Reporte descargado', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Exportación fallida',
        description: err instanceof Error ? err.message : 'No se pudo exportar el reporte',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report types */}
        <div className="space-y-3 lg:col-span-1">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                  selectedReport === report.id
                    ? 'border-primary ring-1 ring-primary'
                    : 'hover:border-muted-foreground/30'
                }`}
              >
                <div className={`rounded-lg p-2 ${report.bg}`}>
                  <Icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuración de Exportación</CardTitle>
            <CardDescription>Configura y descarga tu reporte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha inicial</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha final</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{reports.find((r) => r.id === selectedReport)?.title}</span>
                <span className="text-muted-foreground">
                  &middot; {format.toUpperCase()} &middot;
                  {startDate || endDate
                    ? `${startDate || 'cualquiera'} → ${endDate || 'cualquiera'}`
                    : 'Todo el período'}
                </span>
              </div>
            </div>

            <Button onClick={handleExport} disabled={isExporting} size="lg">
              {isExporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exportando...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Descargar Reporte</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
