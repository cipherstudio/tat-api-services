import { Module } from '@nestjs/common';
import { RedisCacheModule } from '../cache/redis-cache.module.js';
import { RedisCacheService } from '../cache/redis-cache.service.js';

// Import services
import { CountriesService } from './services/countries.service.js';
import { PlacesService } from './services/places.service.js';
import { OfficeDomesticService } from './services/office-domestic.service.js';
import { OfficeInternationalService } from './services/office-international.service.js';
import { ExpensesOtherService } from './services/expenses-other.service.js';
import { ProvincesService } from './services/provinces.service.js';
import { AmphursService } from './services/amphurs.service.js';
import { ExpensesBangkokToPlaceService } from './services/expenses-bangkok-to-place.service.js';
import { ExpensesVehicleService } from './services/expenses-vehicle.service.js';
import { CommitteePositionService } from './services/committee-position.service.js';
import { OutsiderEquivalentService } from './services/outsider-equivalent.service.js';
import { PerDiemRatesService } from './services/per-diem-rates.service';
import { AccommodationRatesService } from './services/accommodation-rates.service';
import { ExpensesOtherConditionsService } from './services/expenses-other-conditions.service';
import { DomesticMovingAllowancesService } from './services/domestic-moving-allowances.service';
import { InternationalMovingAllowancesService } from './services/international-moving-allowances.service';
import { AttireAllowanceRatesService } from './services/attire-allowance-rates.service';
import { AttireDestinationGroupsService } from './services/attire-destination-groups.service';
import { CurrencyService } from './services/currency.service';
import { HolidayWorkRatesService } from './services/holiday-work-rates.service';
import { EntertainmentAllowanceService } from './services/entertainment-allowance.service';
import { ApprovalClothingExpenseService } from './services/approval-clothing-expense.service';
import { ClothingExpenseCancellationRequestService } from './services/clothing-expense-cancellation-request.service';
import { PrivilegeService } from './services/privilege.service.js';
import { MasterdataLabelsService } from './services/masterdata-labels.service';

// Import controllers
import { CountriesController } from './controllers/countries.controller.js';
import { PlacesController } from './controllers/places.controller.js';
import { OfficeDomesticController } from './controllers/office-domestic.controller.js';
import { OfficeInternationalController } from './controllers/office-international.controller.js';
import { ExpensesOtherController } from './controllers/expenses-other.controller.js';
import { ProvincesController } from './controllers/provinces.controller.js';
import { AmphursController } from './controllers/amphurs.controller.js';
import { ExpensesBangkokToPlaceController } from './controllers/expenses-bangkok-to-place.controller.js';
import { ExpensesVehicleController } from './controllers/expenses-vehicle.controller.js';
import { CommitteePositionController } from './controllers/committee-position.controller.js';
import { OutsiderEquivalentController } from './controllers/outsider-equivalent.controller.js';
import { PerDiemRatesController } from './controllers/per-diem-rates.controller';
import { AccommodationRatesController } from './controllers/accommodation-rates.controller';
import { ExpensesOtherConditionsController } from './controllers/expenses-other-conditions.controller';
import { DomesticMovingAllowancesController } from './controllers/domestic-moving-allowances.controller';
import { InternationalMovingAllowancesController } from './controllers/international-moving-allowances.controller';
import { AttireAllowanceRatesController } from './controllers/attire-allowance-rates.controller';
import { AttireDestinationGroupsController } from './controllers/attire-destination-groups.controller';
import { CurrencyController } from './controllers/currency.controller';
import { HolidayWorkRatesController } from './controllers/holiday-work-rates.controller';
import { EntertainmentAllowanceController } from './controllers/entertainment-allowance.controller';
import { ApprovalClothingExpenseController } from './controllers/approval-clothing-expense.controller';
import { ClothingExpenseCancellationRequestController } from './controllers/clothing-expense-cancellation-request.controller';
import { PrivilegeController } from './controllers/privilege.controller.js';
import { MasterdataLabelsController } from './controllers/masterdata-labels.controller';

// Import repositories
import { CountriesRepository } from './repositories/countries.repository.js';
import { PlacesRepository } from './repositories/places.repository.js';
import { OfficeDomesticRepository } from './repositories/office-domestic.repository.js';
import { OfficeInternationalRepository } from './repositories/office-international.repository.js';
import { ExpensesOtherRepository } from './repositories/expenses-other.repository.js';
import { ProvincesRepository } from './repositories/provinces.repository.js';
import { AmphursRepository } from './repositories/amphurs.repository.js';
import { ExpensesBangkokToPlaceRepository } from './repositories/expenses-bangkok-to-place.repository.js';
import { ExpensesVehicleRepository } from './repositories/expenses-vehicle.repository.js';
import { CommitteePositionRepository } from './repositories/committee-position.repository.js';
import { OutsiderEquivalentRepository } from './repositories/outsider-equivalent.repository.js';
import { PerDiemRatesRepository } from './repositories/per-diem-rates.repository';
import { AccommodationRatesRepository } from './repositories/accommodation-rates.repository';
import { ExpensesOtherConditionsRepository } from './repositories/expenses-other-conditions.repository';
import { DomesticMovingAllowancesRepository } from './repositories/domestic-moving-allowances.repository';
import { InternationalMovingAllowancesRepository } from './repositories/international-moving-allowances.repository';
import { AttireAllowanceRatesRepository } from './repositories/attire-allowance-rates.repository';
import { AttireDestinationGroupsRepository } from './repositories/attire-destination-groups.repository';
import { CurrencyRepository } from './repositories/currency.repository';
import { HolidayWorkRatesRepository } from './repositories/holiday-work-rates.repository';
import { EntertainmentAllowanceRepository } from './repositories/entertainment-allowance.repository';
import { ApprovalClothingExpenseRepository } from './repositories/approval-clothing-expense.repository';
import { ClothingExpenseCancellationRequestRepository } from './repositories/clothing-expense-cancellation-request.repository';
import { PrivilegeRepository } from './repositories/privilege.repository.js';
import { MasterdataLabelsRepository } from './repositories/masterdata-labels.repository';

// Import entities
import { HolidayWorkRate } from './entities/holiday-work-rates.entity';
import { HolidayWorkHour } from './entities/holiday-work-hours.entity';
import { MasterdataLabel } from './entities/masterdata-labels.entity';
import { MealAllowanceController } from './controllers/meal-allowance.controller.js';
import { MealAllowanceService } from './services/meal-allowance.service.js';
import { MealAllowanceRepository } from './repositories/meal-allowance.repository.js';
import { EmployeeAdminController } from './controllers/employee-admin.controller';
import { EmployeeAdminService } from './services/employee-admin.service';
import { EmployeeAdminRepository } from './repositories/employee-admin.repository';
import { MenuItemsAccessController } from './controllers/menu-items-access.controller';
import { MenuItemsAccessService } from './services/menu-items-access.service';
import { MenuItemsAccessRepository } from './repositories/menu-items-access.repository';
import { MeetRateController } from './controllers/meet-rate.controller';
import { MeetRateService } from './services/meet-rate.service';
import { MeetRateRepository } from './repositories/meet-rate.repository';

@Module({
  imports: [RedisCacheModule],
  controllers: [
    CountriesController,
    PlacesController,
    OfficeDomesticController,
    OfficeInternationalController,
    ExpensesOtherController,
    ProvincesController,
    AmphursController,
    ExpensesBangkokToPlaceController,
    ExpensesVehicleController,
    CommitteePositionController,
    OutsiderEquivalentController,
    PerDiemRatesController,
    AccommodationRatesController,
    ExpensesOtherConditionsController,
    DomesticMovingAllowancesController,
    InternationalMovingAllowancesController,
    AttireAllowanceRatesController,
    AttireDestinationGroupsController,
    CurrencyController,
    HolidayWorkRatesController,
    EntertainmentAllowanceController,
    ApprovalClothingExpenseController,
    ClothingExpenseCancellationRequestController,
    PrivilegeController,
    MasterdataLabelsController,
    MealAllowanceController,
    EmployeeAdminController,
    MenuItemsAccessController,
    MeetRateController,
  ],
  providers: [
    // Services
    CountriesService,
    PlacesService,
    OfficeDomesticService,
    OfficeInternationalService,
    ExpensesOtherService,
    ProvincesService,
    AmphursService,
    ExpensesBangkokToPlaceService,
    ExpensesVehicleService,
    CommitteePositionService,
    OutsiderEquivalentService,
    PerDiemRatesService,
    AccommodationRatesService,
    ExpensesOtherConditionsService,
    DomesticMovingAllowancesService,
    InternationalMovingAllowancesService,
    AttireAllowanceRatesService,
    AttireDestinationGroupsService,
    CurrencyService,
    HolidayWorkRatesService,
    EntertainmentAllowanceService,
    ApprovalClothingExpenseService,
    ClothingExpenseCancellationRequestService,
    PrivilegeService,
    MasterdataLabelsService,
    MealAllowanceService,
    MeetRateService,
    MenuItemsAccessService,
    EmployeeAdminService,
    MenuItemsAccessService,
    MeetRateService,
    // Repositories
    CountriesRepository,
    PlacesRepository,
    OfficeDomesticRepository,
    OfficeInternationalRepository,
    ExpensesOtherRepository,
    ProvincesRepository,
    AmphursRepository,
    ExpensesBangkokToPlaceRepository,
    ExpensesVehicleRepository,
    CommitteePositionRepository,
    OutsiderEquivalentRepository,
    PerDiemRatesRepository,
    AccommodationRatesRepository,
    ExpensesOtherConditionsRepository,
    DomesticMovingAllowancesRepository,
    InternationalMovingAllowancesRepository,
    AttireAllowanceRatesRepository,
    AttireDestinationGroupsRepository,
    CurrencyRepository,
    HolidayWorkRatesRepository,
    EntertainmentAllowanceRepository,
    ApprovalClothingExpenseRepository,
    ClothingExpenseCancellationRequestRepository,
    PrivilegeRepository,
    MasterdataLabelsRepository,
    MealAllowanceRepository,
    EmployeeAdminRepository,
    MenuItemsAccessRepository,
    MeetRateRepository,
    // Shared services
    RedisCacheService,
    HolidayWorkRate,
    HolidayWorkHour,
    HolidayWorkRatesRepository,
    MasterdataLabel,
  ],
  exports: [
    CountriesService,
    PlacesService,
    OfficeDomesticService,
    OfficeInternationalService,
    ExpensesOtherService,
    ProvincesService,
    AmphursService,
    ExpensesBangkokToPlaceService,
    ExpensesVehicleService,
    CommitteePositionService,
    OutsiderEquivalentService,
    PerDiemRatesService,
    AccommodationRatesService,
    ExpensesOtherConditionsService,
    DomesticMovingAllowancesService,
    InternationalMovingAllowancesService,
    AttireAllowanceRatesService,
    AttireDestinationGroupsService,
    CurrencyService,
    HolidayWorkRatesService,
    ApprovalClothingExpenseService,
    PrivilegeService,
    MasterdataLabelsService,
    MealAllowanceService,
  ],
})
export class MasterDataModule {}
