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
import { ContractorsService } from './contractors.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { QueryContractorDto } from './dto/query-contractor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';
import { parsePagination, buildPaginationMeta } from '../../common/pagination/pagination';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractorsController {
  constructor(
    private readonly contractorsService: ContractorsService,
    private readonly propertiesService: PropertiesService,
  ) {}

  private async canManageProperty(propertyId: string, user: UserProfile): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;
    const property = await this.propertiesService.findById(propertyId);
    return property.ownerId === user.id;
  }

  @Post('properties/:propertyId/contractors')
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateContractorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.contractorsService.create(propertyId, dto);
  }

  @Get('properties/:propertyId/contractors')
  async findAll(
    @Param('propertyId') propertyId: string,
    @Query() query: QueryContractorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user)) && user.role !== Role.SECURITY_GUARD) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }

    const pagination = parsePagination(query);
    const { data, total } = await this.contractorsService.findByProperty(propertyId, {
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search,
    });

    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('contractors/search')
  async search(@Query() query: QueryContractorDto) {
    const pagination = parsePagination(query);
    const { data, total } = await this.contractorsService.searchGlobal({
      skip: pagination.skip,
      take: pagination.limit,
      search: query.search ?? '',
      propertyId: query.propertyId,
    });
    return { data, meta: buildPaginationMeta(total, pagination) };
  }

  @Get('contractors/:id')
  async findOne(@Param('id') id: string) {
    return this.contractorsService.findById(id);
  }

  @Patch('properties/:propertyId/contractors/:id')
  async update(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateContractorDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.contractorsService.update(id, dto);
  }

  @Delete('properties/:propertyId/contractors/:id')
  async remove(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canManageProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.contractorsService.remove(id);
  }
}
