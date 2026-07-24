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
import { VehiclesService } from './vehicles.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly propertiesService: PropertiesService,
  ) {}

  private async canManageProperty(propertyId: string, user: UserProfile): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;
    const property = await this.propertiesService.findById(propertyId);
    return property.ownerId === user.id;
  }

  @Post('property/:propertyId')
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateVehicleDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.vehiclesService.create(propertyId, dto);
  }

  @Get()
  async findAll(@Query() query: { page?: string; limit?: string; plate?: string }) {
    const { parsePagination, buildPaginationMeta } = await import(
      '../../common/pagination/pagination.js'
    );
    const pagination = parsePagination(query);
    const { data, total } = await this.vehiclesService.findAll({
      skip: pagination.skip,
      take: pagination.limit,
      plate: query.plate,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('property/:propertyId')
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user)) && user.role !== Role.SECURITY_GUARD) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.vehiclesService.findByProperty(propertyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: UserProfile,
  ) {
    const vehicle = await this.vehiclesService.findById(id);
    if (
      user.role !== Role.ADMIN &&
      vehicle.property &&
      !(await this.canManageProperty(vehicle.property.id, user))
    ) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ) {
    const vehicle = await this.vehiclesService.findById(id);
    if (
      user.role !== Role.ADMIN &&
      vehicle.property &&
      !(await this.canManageProperty(vehicle.property.id, user))
    ) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.vehiclesService.remove(id);
  }
}
