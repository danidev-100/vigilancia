import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FamilyMembersService } from './family-members.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';

@Controller('properties/:propertyId/family-members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FamilyMembersController {
  constructor(
    private readonly familyMembersService: FamilyMembersService,
    private readonly propertiesService: PropertiesService,
  ) {}

  private async canAccessProperty(propertyId: string, user: UserProfile) {
    if (user.role === Role.ADMIN) return true;
    const property = await this.propertiesService.findById(propertyId);
    return property.ownerId === user.id;
  }

  @Post()
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateFamilyMemberDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canAccessProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only manage your own properties');
    }
    return this.familyMembersService.create(propertyId, dto);
  }

  @Get()
  async findAll(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canAccessProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only view your own properties');
    }
    return this.familyMembersService.findByProperty(propertyId);
  }

  @Get(':id')
  async findOne(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canAccessProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Access denied');
    }
    return this.familyMembersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFamilyMemberDto,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canAccessProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only manage your own properties');
    }
    return this.familyMembersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ) {
    if (!(await this.canAccessProperty(propertyId, user))) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('You can only manage your own properties');
    }
    return this.familyMembersService.remove(id);
  }
}
