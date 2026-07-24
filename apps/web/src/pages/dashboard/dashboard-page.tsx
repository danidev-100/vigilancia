import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-dashboard';
import {
  Users,
  LogIn,
  LogOut,
  Briefcase,
  HardHat,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { Entry, Incident } from '@/types';

const statCards = [
  { key: 'entriesToday', label: 'Ingresos Hoy', icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'exitsToday', label: 'Salidas Hoy', icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { key: 'activeVisitors', label: 'Visitantes Activos', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'activeEmployees', label: 'Empleados Dentro', icon: Briefcase, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { key: 'activeContractors', label: 'Contratistas Dentro', icon: HardHat, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'pendingIncidents', label: 'Incidentes Pendientes', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
];

export function DashboardPage() {
  const { data: statsRes, isLoading } = useDashboardStats();
  const stats = statsRes?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const value = stats?.[card.key as keyof typeof stats] ?? 0;
          const Icon = card.icon;
          return (
            <Card key={card.key} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold">{String(value)}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Actividad Reciente</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/entries">
                Ver todo <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentEntries && stats.recentEntries.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEntries.slice(0, 8).map((entry: Entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1.5 ${entry.entryType === 'entry' ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                        {entry.entryType === 'entry' ? (
                          <LogIn className={`h-4 w-4 ${entry.entryType === 'entry' ? 'text-emerald-500' : 'text-orange-500'}`} />
                        ) : (
                          <LogOut className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{entry.personName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {entry.personType} &middot; {entry.entryType === 'entry' ? 'Ingresó' : 'Salió'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <LogIn className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Incidentes Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/incidents">
                Ver todo <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentIncidents.slice(0, 8).map((incident: Incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-red-500/10 p-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{incident.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        incident.severity === 'critical'
                          ? 'destructive'
                          : incident.severity === 'high'
                            ? 'warning'
                            : incident.severity === 'medium'
                              ? 'info'
                              : 'secondary'
                      }
                      className="shrink-0 text-[10px] uppercase"
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <AlertTriangle className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Sin incidentes recientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
