import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { ValidateVisitorDto } from './dto/validate-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(propertyId: string, authorizedById: string, dto: CreateVisitorDto) {
    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    if (validFrom >= validUntil) {
      throw new BadRequestException('validFrom must be before validUntil');
    }

    // Generate QR code (UUID as payload for now)
    const qrCode = uuidv4();

    const visitor = await this.prisma.visitor.create({
      data: {
        propertyId,
        fullName: dto.fullName,
        document: dto.document ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        vehiclePlate: dto.vehiclePlate ?? null,
        vehicleBrand: dto.vehicleBrand ?? null,
        vehicleModel: dto.vehicleModel ?? null,
        photo: dto.photo ?? null,
        notes: dto.notes ?? null,
        authorizedById,
        visitorType: dto.visitorType ?? 'ONE_TIME',
        validFrom,
        validUntil,
        qrCode,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditLogService.create({
      userId: authorizedById,
      action: 'VISITOR_CREATED',
      entityType: 'VISITOR',
      entityId: visitor.id,
      details: { propertyId, fullName: dto.fullName },
    });

    return visitor;
  }

  async findByProperty(propertyId: string, params: { skip: number; take: number; search?: string }) {
    const where: Record<string, unknown> = { propertyId };

    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { document: { contains: params.search } },
        { phone: { contains: params.search } },
        { vehiclePlate: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          authorizedBy: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
        },
      }),
      this.prisma.visitor.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        authorizedBy: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, houseNumber: true, block: true, street: true } },
      },
    });

    if (!visitor) throw new NotFoundException('Visitor not found');
    return visitor;
  }

  async update(id: string, dto: UpdateVisitorDto) {
    await this.findById(id);

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.document !== undefined) data.document = dto.document;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.vehiclePlate !== undefined) data.vehiclePlate = dto.vehiclePlate;
    if (dto.vehicleBrand !== undefined) data.vehicleBrand = dto.vehicleBrand;
    if (dto.vehicleModel !== undefined) data.vehicleModel = dto.vehicleModel;
    if (dto.photo !== undefined) data.photo = dto.photo;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.visitorType !== undefined) data.visitorType = dto.visitorType;
    if (dto.validFrom !== undefined) data.validFrom = new Date(dto.validFrom);
    if (dto.validUntil !== undefined) data.validUntil = new Date(dto.validUntil);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.visitor.update({
      where: { id },
      data,
    });

    await this.auditLogService.create({
      action: 'VISITOR_UPDATED',
      entityType: 'VISITOR',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.visitor.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'VISITOR_DELETED',
      entityType: 'VISITOR',
      entityId: id,
    });
  }

  async validate(dto: ValidateVisitorDto) {
    const where: Record<string, unknown> = { isActive: true };

    if (dto.qrCode) where.qrCode = dto.qrCode;
    else if (dto.document) where.document = dto.document;
    else if (dto.fullName) where.fullName = { equals: dto.fullName, mode: 'insensitive' };
    else throw new BadRequestException('Provide qrCode, document, or fullName');

    const visitor = await this.prisma.visitor.findFirst({
      where,
      include: {
        property: { select: { id: true, houseNumber: true, block: true, street: true } },
        authorizedBy: { select: { id: true, name: true } },
      },
    });

    if (!visitor) throw new NotFoundException('Visitor not found or inactive');

    const now = new Date();
    if (now < visitor.validFrom) {
      throw new BadRequestException('Visit authorization is not yet valid');
    }
    if (now > visitor.validUntil) {
      throw new BadRequestException('Visit authorization has expired');
    }

    return visitor;
  }

  async regenerateQrCode(id: string) {
    await this.findById(id);

    const newQrCode = uuidv4();

    const updated = await this.prisma.visitor.update({
      where: { id },
      data: { qrCode: newQrCode },
    });

    await this.auditLogService.create({
      action: 'VISITOR_QR_REGENERATED',
      entityType: 'VISITOR',
      entityId: id,
    });

    return updated;
  }

  async searchGlobal(params: { skip: number; take: number; search: string; propertyId?: string }) {
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { document: { contains: params.search } },
        { phone: { contains: params.search } },
        { vehiclePlate: { contains: params.search, mode: 'insensitive' } },
      ],
    };

    if (params.propertyId) where.propertyId = params.propertyId;

    const [data, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { fullName: 'asc' },
        include: {
          property: { select: { id: true, houseNumber: true, block: true, street: true } },
        },
      }),
      this.prisma.visitor.count({ where }),
    ]);

    return { data, total };
  }
}
