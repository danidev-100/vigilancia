import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(propertyId: string, dto: CreateContractorDto) {
    const contractor = await this.prisma.contractor.create({
      data: {
        propertyId,
        company: dto.company,
        employeeName: dto.employeeName,
        nationalId: dto.nationalId ?? null,
        phone: dto.phone ?? null,
        vehiclePlate: dto.vehiclePlate ?? null,
        vehicleBrand: dto.vehicleBrand ?? null,
        vehicleModel: dto.vehicleModel ?? null,
        serviceType: dto.serviceType,
        workOrder: dto.workOrder ?? null,
        authorizedUntil: new Date(dto.authorizedUntil),
      },
    });

    await this.auditLogService.create({
      action: 'CONTRACTOR_CREATED',
      entityType: 'CONTRACTOR',
      entityId: contractor.id,
      details: { propertyId, company: dto.company, employeeName: dto.employeeName },
    });

    return contractor;
  }

  async findByProperty(propertyId: string, params: { skip: number; take: number; search?: string }) {
    const where: Record<string, unknown> = { propertyId };

    if (params.search) {
      where.OR = [
        { company: { contains: params.search, mode: 'insensitive' } },
        { employeeName: { contains: params.search, mode: 'insensitive' } },
        { nationalId: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contractor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { company: 'asc' },
      }),
      this.prisma.contractor.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
    });

    if (!contractor) throw new NotFoundException('Contractor not found');
    return contractor;
  }

  async update(id: string, dto: UpdateContractorDto) {
    await this.findById(id);

    const data: Record<string, unknown> = {};
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.employeeName !== undefined) data.employeeName = dto.employeeName;
    if (dto.nationalId !== undefined) data.nationalId = dto.nationalId;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.vehiclePlate !== undefined) data.vehiclePlate = dto.vehiclePlate;
    if (dto.vehicleBrand !== undefined) data.vehicleBrand = dto.vehicleBrand;
    if (dto.vehicleModel !== undefined) data.vehicleModel = dto.vehicleModel;
    if (dto.serviceType !== undefined) data.serviceType = dto.serviceType;
    if (dto.workOrder !== undefined) data.workOrder = dto.workOrder;
    if (dto.authorizedUntil !== undefined) data.authorizedUntil = new Date(dto.authorizedUntil);

    const updated = await this.prisma.contractor.update({ where: { id }, data });

    await this.auditLogService.create({
      action: 'CONTRACTOR_UPDATED',
      entityType: 'CONTRACTOR',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.contractor.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'CONTRACTOR_DELETED',
      entityType: 'CONTRACTOR',
      entityId: id,
    });
  }

  async searchGlobal(params: { skip: number; take: number; search: string; propertyId?: string }) {
    const where: Record<string, unknown> = {
      OR: [
        { company: { contains: params.search, mode: 'insensitive' } },
        { employeeName: { contains: params.search, mode: 'insensitive' } },
        { nationalId: { contains: params.search } },
        { phone: { contains: params.search } },
      ],
    };

    if (params.propertyId) where.propertyId = params.propertyId;

    const [data, total] = await Promise.all([
      this.prisma.contractor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { company: 'asc' },
        include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
      }),
      this.prisma.contractor.count({ where }),
    ]);

    return { data, total };
  }
}
