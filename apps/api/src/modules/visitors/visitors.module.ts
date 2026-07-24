import { Module } from '@nestjs/common';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';
import { PropertiesService } from '../properties/properties.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService, PropertiesService, PrismaService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
