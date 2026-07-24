import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { FamilyMembersModule } from './modules/family-members/family-members.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ContractorsModule } from './modules/contractors/contractors.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { EntriesModule } from './modules/entries/entries.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SearchModule } from './modules/search/search.module';
import { GatewayModule } from './modules/gateway/gateway.module';

@Module({
  imports: [
    // Global rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    PropertiesModule,
    FamilyMembersModule,
    VisitorsModule,
    EmployeesModule,
    ContractorsModule,
    VehiclesModule,
    EntriesModule,
    IncidentsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
    AuditLogModule,
    SearchModule,
    GatewayModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
