import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(guardId: string, dto: CreateIncidentDto) {
    const incident = await this.prisma.incident.create({
      data: {
        guardId,
        title: dto.title,
        description: dto.description,
        incidentType: dto.incidentType ?? 'OTHER',
        photos: dto.photos ?? [],
      },
      include: { guard: { select: { id: true, name: true } } },
    });

    await this.auditLogService.create({
      userId: guardId,
      action: 'INCIDENT_CREATED',
      entityType: 'INCIDENT',
      entityId: incident.id,
      details: { title: dto.title, incidentType: dto.incidentType },
    });

    return incident;
  }

  async findAll(params: {
    skip: number;
    take: number;
    incidentType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Record<string, unknown> = {};

    if (params.incidentType) where.incidentType = params.incidentType;
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) (where.createdAt as Record<string, unknown>).gte = params.dateFrom;
      if (params.dateTo) (where.createdAt as Record<string, unknown>).lte = params.dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { guard: { select: { id: true, name: true } } },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: { guard: { select: { id: true, name: true } } },
    });

    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.incident.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'INCIDENT_DELETED',
      entityType: 'INCIDENT',
      entityId: id,
    });
  }
}
