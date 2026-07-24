import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('entries')
  @Roles(Role.ADMIN, Role.SECURITY_GUARD, Role.PROPERTY_OWNER)
  async getEntryReport(
    @Query() query: {
      page?: string;
      limit?: string;
      dateFrom?: string;
      dateTo?: string;
      ownerId?: string;
      guardId?: string;
      propertyId?: string;
    },
  ) {
    const pagination = parsePagination(query);

    const { data, total } = await this.reportsService.getEntryReport({
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      ownerId: query.ownerId,
      guardId: query.guardId,
      propertyId: query.propertyId,
      skip: pagination.skip,
      take: pagination.limit,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('visitors')
  @Roles(Role.ADMIN, Role.PROPERTY_OWNER)
  async getVisitorReport(
    @Query() query: {
      page?: string;
      limit?: string;
      dateFrom?: string;
      dateTo?: string;
      propertyId?: string;
    },
  ) {
    const pagination = parsePagination(query);

    const { data, total } = await this.reportsService.getVisitorReport({
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      propertyId: query.propertyId,
      skip: pagination.skip,
      take: pagination.limit,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }
}
