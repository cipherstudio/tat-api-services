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

@Module({
  imports: [
    RedisCacheModule,
  ],
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
    // Shared services
    RedisCacheService,
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
  ],
})
export class MasterDataModule {} 