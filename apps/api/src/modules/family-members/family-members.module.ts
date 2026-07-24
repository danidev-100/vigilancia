import { Module } from '@nestjs/common';
import { FamilyMembersController } from './family-members.controller';
import { FamilyMembersService } from './family-members.service';
import { PropertiesService } from '../properties/properties.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService, PropertiesService, PrismaService],
  exports: [FamilyMembersService],
})
export class FamilyMembersModule {}
