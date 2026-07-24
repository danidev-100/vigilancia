import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PropertiesService } from '../properties/properties.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, PropertiesService, PrismaService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
