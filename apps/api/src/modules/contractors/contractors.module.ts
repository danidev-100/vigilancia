import { Module } from '@nestjs/common';
import { ContractorsController } from './contractors.controller';
import { ContractorsService } from './contractors.service';
import { PropertiesService } from '../properties/properties.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [ContractorsController],
  providers: [ContractorsService, PropertiesService, PrismaService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
