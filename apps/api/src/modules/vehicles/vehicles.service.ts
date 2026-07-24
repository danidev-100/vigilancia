import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(propertyId: string, dto: CreateVehicleDto) {
    // Check for duplicate plate within the same owner scope
    if (dto.ownerId) {
      const existing = await this.prisma.vehicle.findFirst({
        where: { plate: dto.plate, ownerType: dto.ownerType, ownerId: dto.ownerId },
      });
      if (existing) {
        throw new ConflictException('Vehicle with this plate already registered for this owner');
      }
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        plate: dto.plate,
        brand: dto.brand,
        model: dto.model,
        color: dto.color ?? null,
        ownerType: dto.ownerType,
        propertyId: propertyId ?? null,
        ownerId: dto.ownerId ?? null,
        familyMemberId: dto.familyMemberId ?? null,
      },
    });

    await this.auditLogService.create({
      action: 'VEHICLE_CREATED',
      entityType: 'VEHICLE',
      entityId: vehicle.id,
      details: { propertyId, plate: dto.plate, ownerType: dto.ownerType },
    });

    return vehicle;
  }

  async findByProperty(propertyId: string) {
    return this.prisma.vehicle.findMany({
      where: { propertyId },
      include: { familyMember: { select: { id: true, fullName: true } } },
      orderBy: { plate: 'asc' },
    });
  }

  async findAll(params: { skip: number; take: number; plate?: string }) {
    const where: Record<string, unknown> = {};
    if (params.plate) where.plate = { contains: params.plate, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { plate: 'asc' },
        include: { property: { select: { id: true, houseNumber: true, block: true } } },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, houseNumber: true, block: true, street: true } },
        familyMember: { select: { id: true, fullName: true } },
      },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findById(id);

    const data: Record<string, unknown> = {};
    if (dto.plate !== undefined) data.plate = dto.plate;
    if (dto.brand !== undefined) data.brand = dto.brand;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.ownerType !== undefined) data.ownerType = dto.ownerType;
    if (dto.ownerId !== undefined) data.ownerId = dto.ownerId;
    if (dto.familyMemberId !== undefined) data.familyMemberId = dto.familyMemberId;

    const updated = await this.prisma.vehicle.update({ where: { id }, data });

    await this.auditLogService.create({
      action: 'VEHICLE_UPDATED',
      entityType: 'VEHICLE',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.vehicle.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'VEHICLE_DELETED',
      entityType: 'VEHICLE',
      entityId: id,
    });
  }
}
