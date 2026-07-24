import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateEntryDto } from './dto/create-entry.dto';

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(guardId: string, dto: CreateEntryDto) {
    // Validate that at least one person reference is provided
    if (!dto.visitorId && !dto.employeeId && !dto.contractorId && !dto.familyMemberId) {
      throw new BadRequestException('One of visitorId, employeeId, contractorId, or familyMemberId is required');
    }

    const entry = await this.prisma.entry.create({
      data: {
        personType: dto.personType,
        visitorId: dto.visitorId ?? null,
        employeeId: dto.employeeId ?? null,
        contractorId: dto.contractorId ?? null,
        familyMemberId: dto.familyMemberId ?? null,
        guardId,
        propertyId: dto.propertyId ?? null,
        gate: dto.gate,
        entryMethod: dto.entryMethod ?? 'MANUAL',
        photo: dto.photo ?? null,
        notes: dto.notes ?? null,
      },
      include: {
        guard: { select: { id: true, name: true } },
        visitor: { select: { id: true, fullName: true } },
        employee: { select: { id: true, fullName: true } },
        contractor: { select: { id: true, employeeName: true, company: true } },
        familyMember: { select: { id: true, fullName: true } },
      },
    });

    await this.auditLogService.create({
      userId: guardId,
      action: 'ENTRY_CREATED',
      entityType: 'ENTRY',
      entityId: entry.id,
      details: { personType: dto.personType, gate: dto.gate },
    });

    return entry;
  }

  async registerExit(id: string, guardId: string) {
    const entry = await this.prisma.entry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.exitTime) throw new BadRequestException('Exit already registered for this entry');

    const updated = await this.prisma.entry.update({
      where: { id },
      data: { exitTime: new Date() },
      include: {
        guard: { select: { id: true, name: true } },
        visitor: { select: { id: true, fullName: true } },
        employee: { select: { id: true, fullName: true } },
        contractor: { select: { id: true, employeeName: true, company: true } },
        familyMember: { select: { id: true, fullName: true } },
      },
    });

    await this.auditLogService.create({
      userId: guardId,
      action: 'EXIT_REGISTERED',
      entityType: 'ENTRY',
      entityId: id,
    });

    return updated;
  }

  async findActive(params: { skip: number; take: number; propertyId?: string }) {
    const where: Record<string, unknown> = { exitTime: null };

    if (params.propertyId) where.propertyId = params.propertyId;

    const [data, total] = await Promise.all([
      this.prisma.entry.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { entryTime: 'desc' },
        include: {
          guard: { select: { id: true, name: true } },
          visitor: { select: { id: true, fullName: true, phone: true, document: true } },
          employee: { select: { id: true, fullName: true, phone: true, company: true } },
          contractor: { select: { id: true, employeeName: true, company: true } },
          familyMember: { select: { id: true, fullName: true } },
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
        },
      }),
      this.prisma.entry.count({ where }),
    ]);

    return { data, total };
  }

  async findAll(params: {
    skip: number;
    take: number;
    propertyId?: string;
    personType?: string;
    guardId?: string;
    gate?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Record<string, unknown> = {};

    if (params.propertyId) where.propertyId = params.propertyId;
    if (params.personType) where.personType = params.personType;
    if (params.guardId) where.guardId = params.guardId;
    if (params.gate) where.gate = params.gate;
    if (params.dateFrom || params.dateTo) {
      where.entryTime = {};
      if (params.dateFrom) (where.entryTime as Record<string, unknown>).gte = params.dateFrom;
      if (params.dateTo) (where.entryTime as Record<string, unknown>).lte = params.dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.entry.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { entryTime: 'desc' },
        include: {
          guard: { select: { id: true, name: true } },
          visitor: { select: { id: true, fullName: true, phone: true, document: true } },
          employee: { select: { id: true, fullName: true, phone: true, company: true } },
          contractor: { select: { id: true, employeeName: true, company: true } },
          familyMember: { select: { id: true, fullName: true } },
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
        },
      }),
      this.prisma.entry.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      include: {
        guard: { select: { id: true, name: true } },
        visitor: { select: { id: true, fullName: true, phone: true, document: true } },
        employee: { select: { id: true, fullName: true } },
        contractor: { select: { id: true, employeeName: true, company: true } },
        familyMember: { select: { id: true, fullName: true } },
        property: { select: { id: true, houseNumber: true, block: true, street: true } },
      },
    });

    if (!entry) throw new NotFoundException('Entry not found');
    return entry;
  }
}
