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

// Import controllers
import { CountriesController } from './controllers/countries.controller.js';
import { PlacesController } from './controllers/places.controller.js';
import { OfficeDomesticController } from './controllers/office-domestic.controller.js';
import { OfficeInternationalController } from './controllers/office-international.controller.js';
import { ExpensesOtherController } from './controllers/expenses-other.controller.js';
import { ProvincesController } from './controllers/provinces.controller.js';

// Import repositories
import { CountriesRepository } from './repositories/countries.repository.js';
import { PlacesRepository } from './repositories/places.repository.js';
import { OfficeDomesticRepository } from './repositories/office-domestic.repository.js';
import { OfficeInternationalRepository } from './repositories/office-international.repository.js';
import { ExpensesOtherRepository } from './repositories/expenses-other.repository.js';
import { ProvincesRepository } from './repositories/provinces.repository.js';

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
  ],
  providers: [
    // Services
    CountriesService,
    PlacesService,
    OfficeDomesticService,
    OfficeInternationalService,
    ExpensesOtherService,
    ProvincesService,
    // Repositories
    CountriesRepository,
    PlacesRepository,
    OfficeDomesticRepository,
    OfficeInternationalRepository,
    ExpensesOtherRepository,
    ProvincesRepository,
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
  ],
})
export class MasterDataModule {} 