import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(Role.SECURITY_GUARD, Role.ADMIN)
  async create(@CurrentUser() user: UserProfile, @Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(user.id, dto);
  }

  @Get()
  async findAll(@Query() query: QueryIncidentDto, @CurrentUser() user: UserProfile) {
    const pagination = parsePagination(query);

    // Admins see all, owners see nothing for now (incidents are guard-specific)
    // A more detailed version could filter by guard's assigned properties
    if (user.role === Role.PROPERTY_OWNER) {
      return { data: [], meta: buildPaginationMeta(0, pagination) };
    }

    const { data, total } = await this.incidentsService.findAll({
      skip: pagination.skip,
      take: pagination.limit,
      incidentType: query.incidentType,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.incidentsService.findById(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
