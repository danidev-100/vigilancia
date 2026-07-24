import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        ownerId,
        houseNumber: dto.houseNumber,
        block: dto.block,
        street: dto.street,
        neighborhood: dto.neighborhood,
        status: dto.status,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await this.auditLogService.create({
      userId: ownerId,
      action: 'PROPERTY_CREATED',
      entityType: 'PROPERTY',
      entityId: property.id,
      details: { houseNumber: dto.houseNumber, block: dto.block },
    });

    return property;
  }

  async findAll(params: {
    skip: number;
    take: number;
    ownerId?: string;
    search?: string;
    status?: string;
    neighborhood?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (params.ownerId) where.ownerId = params.ownerId;
    if (params.status) where.status = params.status;
    if (params.neighborhood) where.neighborhood = params.neighborhood;
    if (params.search) {
      where.OR = [
        { houseNumber: { contains: params.search, mode: 'insensitive' } },
        { block: { contains: params.search, mode: 'insensitive' } },
        { street: { contains: params.search, mode: 'insensitive' } },
        { neighborhood: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true, email: true, role: true } } },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        familyMembers: true,
        vehicles: true,
      },
    });

    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto) {
    await this.findById(id);

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.houseNumber !== undefined && { houseNumber: dto.houseNumber }),
        ...(dto.block !== undefined && { block: dto.block }),
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.neighborhood !== undefined && { neighborhood: dto.neighborhood }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await this.auditLogService.create({
      action: 'PROPERTY_UPDATED',
      entityType: 'PROPERTY',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.property.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'PROPERTY_DELETED',
      entityType: 'PROPERTY',
      entityId: id,
    });
  }
}
