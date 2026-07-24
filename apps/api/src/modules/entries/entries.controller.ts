import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { QueryEntryDto } from './dto/query-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller('entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @Roles(Role.SECURITY_GUARD, Role.ADMIN)
  async create(@CurrentUser() user: UserProfile, @Body() dto: CreateEntryDto) {
    return this.entriesService.create(user.id, dto);
  }

  @Post(':id/exit')
  @Roles(Role.SECURITY_GUARD, Role.ADMIN)
  async registerExit(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.entriesService.registerExit(id, user.id);
  }

  @Get('active')
  async findActive(@Query() query: QueryEntryDto) {
    const pagination = parsePagination(query);
    const { data, total } = await this.entriesService.findActive({
      skip: pagination.skip,
      take: pagination.limit,
      propertyId: query.propertyId,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get()
  async findAll(@Query() query: QueryEntryDto, @CurrentUser() user: UserProfile) {
    const pagination = parsePagination(query);

    const filters: Record<string, unknown> = {
      skip: pagination.skip,
      take: pagination.limit,
    };

    if (query.propertyId) filters.propertyId = query.propertyId;
    if (query.personType) filters.personType = query.personType;
    if (query.guardId) filters.guardId = query.guardId;
    if (query.gate) filters.gate = query.gate;
    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);

    // Owners only see their own properties
    if (user.role === Role.PROPERTY_OWNER && !filters.propertyId) {
      const { PropertiesService } = await import('../properties/properties.service.js');
      const prisma = await import('../../common/prisma/prisma.service.js');
      const propService = new PropertiesService(
        new prisma.PrismaService(),
        null as unknown as import('../audit-log/audit-log.service.js').AuditLogService,
      );
      const ownProps = await propService.findAll({
        skip: 0,
        take: 1000,
        ownerId: user.id,
      });
      const ownIds = ownProps.data.map((p: { id: string }) => p.id);
      if (ownIds.length > 0) {
        filters.propertyId = { in: ownIds };
      } else {
        return { data: [], meta: buildPaginationMeta(0, pagination) };
      }
    }

    const { data, total } = await this.entriesService.findAll(
      filters as {
        skip: number;
        take: number;
        propertyId?: string;
        personType?: string;
        guardId?: string;
        gate?: string;
        dateFrom?: Date;
        dateTo?: Date;
      },
    );

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.entriesService.findById(id);
  }
}
