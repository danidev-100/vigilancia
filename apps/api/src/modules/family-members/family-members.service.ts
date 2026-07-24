import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@Injectable()
export class FamilyMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(propertyId: string, dto: CreateFamilyMemberDto) {
    const member = await this.prisma.familyMember.create({
      data: {
        propertyId,
        fullName: dto.fullName,
        nationalId: dto.nationalId ?? null,
        phone: dto.phone,
        relationship: dto.relationship,
        photo: dto.photo ?? null,
      },
    });

    await this.auditLogService.create({
      action: 'FAMILY_MEMBER_CREATED',
      entityType: 'FAMILY_MEMBER',
      entityId: member.id,
      details: { propertyId, fullName: dto.fullName },
    });

    return member;
  }

  async findByProperty(propertyId: string) {
    return this.prisma.familyMember.findMany({
      where: { propertyId },
      include: { vehicles: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findById(id: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id },
      include: { vehicles: true, property: { select: { id: true, ownerId: true } } },
    });

    if (!member) throw new NotFoundException('Family member not found');
    return member;
  }

  async update(id: string, dto: UpdateFamilyMemberDto) {
    await this.findById(id);

    const updated = await this.prisma.familyMember.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.nationalId !== undefined && { nationalId: dto.nationalId }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.relationship !== undefined && { relationship: dto.relationship }),
        ...(dto.photo !== undefined && { photo: dto.photo }),
      },
    });

    await this.auditLogService.create({
      action: 'FAMILY_MEMBER_UPDATED',
      entityType: 'FAMILY_MEMBER',
      entityId: id,
      details: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.familyMember.delete({ where: { id } });

    await this.auditLogService.create({
      action: 'FAMILY_MEMBER_DELETED',
      entityType: 'FAMILY_MEMBER',
      entityId: id,
    });
  }
}
