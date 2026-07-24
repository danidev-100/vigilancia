import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly propertiesService: PropertiesService,
  ) {}

  private async canManageProperty(propertyId: string, user: UserProfile): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;
    const property = await this.propertiesService.findById(propertyId);
    return property.ownerId === user.id;
  }

  @Post('properties/:propertyId/employees')
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.employeesService.create(propertyId, dto);
  }

  @Get('properties/:propertyId/employees')
  async findAll(
    @Param('propertyId') propertyId: string,
    @Query() query: QueryEmployeeDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user)) && user.role !== Role.SECURITY_GUARD) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }

    const pagination = parsePagination(query);
    const { data, total } = await this.employeesService.findByProperty(propertyId, {
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('employees/search')
  async search(@Query() query: QueryEmployeeDto) {
    const pagination = parsePagination(query);
    const { data, total } = await this.employeesService.searchGlobal({
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search ?? '',
      propertyId: query.propertyId,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('employees/:id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Patch('properties/:propertyId/employees/:id')
  async update(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.employeesService.update(id, dto);
  }

  @Delete('properties/:propertyId/employees/:id')
  async remove(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.employeesService.remove(id);
  }
}
