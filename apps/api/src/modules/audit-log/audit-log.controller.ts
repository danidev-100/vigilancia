import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: QueryAuditLogDto) {
    const pagination = parsePagination(query);
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const { data, total } = await this.auditLogService.findAll({
      skip: pagination.skip,
      take: pagination.limit,
      userId: query.userId,
      action: query.action,
      entityType: query.entityType,
      startDate,
      endDate,
    });

    return {
      data,
      meta: buildPaginationMeta(total, pagination),
    };
  }
}
