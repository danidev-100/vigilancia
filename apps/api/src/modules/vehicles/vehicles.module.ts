import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { PropertiesService } from '../properties/properties.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, PropertiesService, PrismaService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
