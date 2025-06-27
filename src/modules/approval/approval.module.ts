import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { ApprovalRepository } from './repositories/approval.repository';
import { ApprovalStatusLabelRepository } from './repositories/approval-status-label.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    RedisCacheModule,
    FilesModule,
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService, ApprovalRepository, ApprovalStatusLabelRepository, RedisCacheService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
