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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@CurrentUser() user: UserProfile, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: UserProfile, @Query() query: QueryPropertyDto) {
    const pagination = parsePagination(query);
    const isAdmin = user.role === Role.ADMIN;

    const { data, total } = await this.propertiesService.findAll({
      skip: pagination.skip,
      take: pagination.limit,
      ownerId: isAdmin ? undefined : user.id,
      search: query.search,
      status: query.status,
      neighborhood: query.neighborhood,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    const property = await this.propertiesService.findById(id);
    if (user.role !== Role.ADMIN && property.ownerId !== user.id) {
      const { owner, ...rest } = property;
      return rest;
    }
    return property;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: UserProfile,
  ) {
    const property = await this.propertiesService.findById(id);
    if (user.role !== Role.ADMIN && property.ownerId !== user.id) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only update your own properties');
    }
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    const property = await this.propertiesService.findById(id);
    if (user.role !== Role.ADMIN && property.ownerId !== user.id) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only delete your own properties');
    }
    return this.propertiesService.remove(id);
  }
}
