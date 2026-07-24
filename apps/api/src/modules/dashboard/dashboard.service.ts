import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { DashboardStats, Role } from '@vigilancia/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId?: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      entriesToday,
      exitsToday,
      activeVisitors,
      activeEmployees,
      contractorsInside,
      incidentsToday,
      recentEntries,
    ] = await Promise.all([
      // Entries today
      this.prisma.entry.count({
        where: {
          entryTime: { gte: today, lt: tomorrow },
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Exits today
      this.prisma.entry.count({
        where: {
          exitTime: { gte: today, lt: tomorrow },
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Active visitors (currently inside)
      this.prisma.entry.count({
        where: {
          exitTime: null,
          personType: 'VISITOR',
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Active employees (currently inside)
      this.prisma.entry.count({
        where: {
          exitTime: null,
          personType: 'EMPLOYEE',
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Contractors inside
      this.prisma.entry.count({
        where: {
          exitTime: null,
          personType: 'CONTRACTOR',
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Incidents today
      this.prisma.incident.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          ...(userId ? { guardId: userId } : {}),
        },
      }),
      // Recent activity (last 10 entries)
      this.prisma.entry.findMany({
        where: userId ? { guardId: userId } : {},
        orderBy: { entryTime: 'desc' },
        take: 10,
        include: {
          guard: { select: { id: true, email: true, name: true, phone: true, role: true, photo: true, emailVerified: true } },
          visitor: { select: { id: true, fullName: true } },
          employee: { select: { id: true, fullName: true } },
          contractor: { select: { id: true, employeeName: true, company: true } },
          familyMember: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    return {
      entriesToday,
      exitsToday,
      activeVisitors,
      activeEmployees,
      contractorsInside,
      incidentsToday,
      recentActivity: recentEntries.map((e) => ({
        ...e,
        entryTime: e.entryTime.toISOString(),
        exitTime: e.exitTime?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
        personType: e.personType as DashboardStats['recentActivity'][0]['personType'],
        entryMethod: e.entryMethod as DashboardStats['recentActivity'][0]['entryMethod'],
        guard: { ...e.guard, role: e.guard.role as unknown as Role },
      })),
    };
  }
}
