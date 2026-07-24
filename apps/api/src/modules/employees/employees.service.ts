import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(propertyId: string, dto: CreateEmployeeDto) {
    const employee = await this.prisma.employee.create({
      data: {
        propertyId,
        fullName: dto.fullName,
        nationalId: dto.nationalId ?? null,
        phone: dto.phone,
        position: dto.position,
        company: dto.company,
        vehiclePlate: dto.vehiclePlate ?? null,
        workSchedule: dto.workSchedule ?? null,
        photo: dto.photo ?? null,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditLogService.create({
      action: 'EMPLOYEE_CREATED',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      details: { propertyId, fullName: dto.fullName, company: dto.company },
    });

    return employee;
  }

  async findByProperty(propertyId: string, params: { skip: number; take: number; search?: string }) {
    const where: Record<string, unknown> = { propertyId };

    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { nationalId: { contains: params.search } },
        { phone: { contains: params.search } },
        { company: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findById(id);

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.nationalId !== undefined) data.nationalId = dto.nationalId;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.vehiclePlate !== undefined) data.vehiclePlate = dto.vehiclePlate;
    if (dto.workSchedule !== undefined) data.workSchedule = dto.workSchedule;
    if (dto.photo !== undefined) data.photo = dto.photo;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.employee.update({ where: { id }, data });

    await this.auditLogService.create({
      action: 'EMPLOYEE_UPDATED',
      entityType: 'EMPLOYEE',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.employee.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'EMPLOYEE_DELETED',
      entityType: 'EMPLOYEE',
      entityId: id,
    });
  }

  async searchGlobal(params: { skip: number; take: number; search: string; propertyId?: string }) {
    const where: Record<string, unknown> = {
      OR: [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { nationalId: { contains: params.search } },
        { phone: { contains: params.search } },
        { company: { contains: params.search, mode: 'insensitive' } },
      ],
    };

    if (params.propertyId) where.propertyId = params.propertyId;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { fullName: 'asc' },
        include: { property: { select: { id: true, houseNumber: true, block: true, street: true } } },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total };
  }
}
