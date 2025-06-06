import { Module } from '@nestjs/common';
import { DisbursementsupportingService } from './disbursementsupporting.service';
import { DisbursementsupportingController } from './disbursementsupporting.controller';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { DisbursementSupportingDocumentTypeRepository } from './repositories/disbursement-supporting-document-type.repository';
import { DisbursementSupportingFormRepository } from './repositories/disbursement-supporting-form.repository';
import { DisbursementSupportingQuestionRepository } from './repositories/disbursement-supporting-question.repository';

@Module({
  imports: [RedisCacheModule],
  controllers: [DisbursementsupportingController],
  providers: [
    DisbursementsupportingService,
    RedisCacheService,
    DisbursementSupportingDocumentTypeRepository,
    DisbursementSupportingFormRepository,
    DisbursementSupportingQuestionRepository,
  ],
  exports: [DisbursementsupportingService],
})
export class DisbursementsupportingModule {}
