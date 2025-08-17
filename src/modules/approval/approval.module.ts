import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { ApprovalRepository } from './repositories/approval.repository';
import { ApprovalStatusLabelRepository } from './repositories/approval-status-label.repository';
import { ApprovalAttachmentRepository } from './repositories/approval-attachment.repository';
import { ApprovalAttachmentService } from './services/approval-attachment.service';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { FilesModule } from '../files/files.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [RedisCacheModule, FilesModule, NotificationModule],
  controllers: [ApprovalController],
  providers: [
    ApprovalService,
    ApprovalRepository,
    ApprovalStatusLabelRepository,
    ApprovalAttachmentRepository,
    ApprovalAttachmentService,
    RedisCacheService,
  ],
  exports: [ApprovalService, ApprovalAttachmentService],
})
export class ApprovalModule {}
