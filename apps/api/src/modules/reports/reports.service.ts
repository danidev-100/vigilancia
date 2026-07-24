import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEntryReport(params: {
    dateFrom?: Date;
    dateTo?: Date;
    ownerId?: string;
    guardId?: string;
    propertyId?: string;
    skip: number;
    take: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.dateFrom || params.dateTo) {
      where.entryTime = {};
      if (params.dateFrom) (where.entryTime as Record<string, unknown>).gte = params.dateFrom;
      if (params.dateTo) (where.entryTime as Record<string, unknown>).lte = params.dateTo;
    }

    if (params.guardId) where.guardId = params.guardId;
    if (params.propertyId) where.propertyId = params.propertyId;

    // If ownerId, find their properties first
    if (params.ownerId) {
      const ownedProperties = await this.prisma.property.findMany({
        where: { ownerId: params.ownerId },
        select: { id: true },
      });
      where.propertyId = { in: ownedProperties.map((p) => p.id) };
    }

    const [data, total] = await Promise.all([
      this.prisma.entry.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { entryTime: 'desc' },
        include: {
          guard: { select: { id: true, name: true } },
          visitor: { select: { id: true, fullName: true, document: true } },
          employee: { select: { id: true, fullName: true, company: true } },
          contractor: { select: { id: true, employeeName: true, company: true } },
          familyMember: { select: { id: true, fullName: true } },
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
        },
      }),
      this.prisma.entry.count({ where }),
    ]);

    return { data, total };
  }

  async getVisitorReport(params: {
    dateFrom?: Date;
    dateTo?: Date;
    propertyId?: string;
    skip: number;
    take: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) (where.createdAt as Record<string, unknown>).gte = params.dateFrom;
      if (params.dateTo) (where.createdAt as Record<string, unknown>).lte = params.dateTo;
    }

    if (params.propertyId) where.propertyId = params.propertyId;

    const [data, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
          authorizedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.visitor.count({ where }),
    ]);

    return { data, total };
  }
}
