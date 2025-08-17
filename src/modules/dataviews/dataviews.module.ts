import { Module } from '@nestjs/common';
import { DataviewsService } from './dataviews.service';
import { DataviewsController } from './dataviews.controller';
import { DataviewsRepository } from './repositories/dataviews.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { AbDeputyRepository } from './repositories/ab-deputy.repository';
import { AbHolidayRepository } from './repositories/ab-holiday.repository';
import { OpChildrenTRepository } from './repositories/op-children-t.repository';
import { OpHeadTRepository } from './repositories/op-head-t.repository';
import { OpMasterTRepository } from './repositories/op-master-t.repository';
import { OpOrganizeRRepository } from './repositories/op-organize-r.repository';
import { OpPositionNoTRepository } from './repositories/op-position-no-t.repository';
import { OpPosExecutiveRRepository } from './repositories/op-pos-executive-r.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { ViewPosition4otRepository } from './repositories/view-position-4ot.repository';
import { VBudgetCodeRepository } from './repositories/v-budget-code.repository';
import { VTxOtRepository } from './repositories/v-tx-ot.repository';
import { OpPosWorkRRepository } from './repositories/op-pos-work-r.repository';
import { OpPositionTRepository } from './repositories/op-position-t.repository';
import { PsPwJobRepository } from './repositories/ps-pw-job.repository';
import { OpLevelSalRRepository } from './repositories/op-level-sal-r.repository';
import { OrganizationStructureController } from './controllers/organization-structure.controller';
import { OrganizationStructureService } from './services/organization-structure.service';
import { OrganizationStructureRepository } from './repositories/organization-structure.repository';
@Module({
  imports: [RedisCacheModule],
  controllers: [DataviewsController, OrganizationStructureController],
  providers: [
    DataviewsService,
    DataviewsRepository,
    EmployeeRepository,
    AbDeputyRepository,
    AbHolidayRepository,
    OpChildrenTRepository,
    OpHeadTRepository,
    OpMasterTRepository,
    OpOrganizeRRepository,
    OpPositionNoTRepository,
    OpPosExecutiveRRepository,
    OpPosWorkRRepository,
    OpPositionTRepository,
    RedisCacheService,
    ViewPosition4otRepository,
    VBudgetCodeRepository,
    VTxOtRepository,
    PsPwJobRepository,
    OpLevelSalRRepository,
    OrganizationStructureService,
    OrganizationStructureRepository,
  ],
  exports: [DataviewsService, OrganizationStructureService],
})
export class DataviewsModule {}
