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
import { VisitorsService } from './visitors.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { QueryVisitorDto } from './dto/query-visitor.dto';
import { ValidateVisitorDto } from './dto/validate-visitor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorsController {
  constructor(
    private readonly visitorsService: VisitorsService,
    private readonly propertiesService: PropertiesService,
  ) {}

  private async canManageProperty(propertyId: string, user: UserProfile): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;
    const property = await this.propertiesService.findById(propertyId);
    return property.ownerId === user.id;
  }

  @Post('properties/:propertyId/visitors')
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateVisitorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.visitorsService.create(propertyId, user.id, dto);
  }

  @Get('properties/:propertyId/visitors')
  async findAll(
    @Param('propertyId') propertyId: string,
    @Query() query: QueryVisitorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user)) && user.role !== Role.SECURITY_GUARD) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    const pagination = parsePagination(query);
    const { data, total } = await this.visitorsService.findByProperty(propertyId, {
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('visitors/search')
  async search(
    @Query() query: QueryVisitorDto,
    @CurrentUser() user: UserProfile,
  ) {
    const pagination = parsePagination(query);
    const { data, total } = await this.visitorsService.searchGlobal({
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search ?? '',
      propertyId: query.propertyId,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('visitors/:id')
  async findOne(@Param('id') id: string) {
    return this.visitorsService.findById(id);
  }

  @Patch('properties/:propertyId/visitors/:id')
  async update(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateVisitorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.visitorsService.update(id, dto);
  }

  @Delete('properties/:propertyId/visitors/:id')
  async remove(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.visitorsService.remove(id);
  }

  @Post('visitors/validate')
  async validate(@Body() dto: ValidateVisitorDto) {
    return this.visitorsService.validate(dto);
  }

  @Post('properties/:propertyId/visitors/:id/regenerate-qr')
  async regenerateQr(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.visitorsService.regenerateQrCode(id);
  }
}
