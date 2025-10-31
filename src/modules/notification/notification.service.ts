import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationType,
  EntityType,
} from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { WebSocketUtil } from '../../common/utils/websocket.util';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class NotificationService {
  private readonly CACHE_PREFIX = 'notification';
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly websocketUtil: WebSocketUtil,
    private readonly cacheService: RedisCacheService,
  ) {}

  async createNotification(
    employeeCode: string,
    title: string,
    message: string,
    type: NotificationType,
    entityType: EntityType,
    entityId: number,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    // Convert metadata object to JSON string for Oracle DB compatibility
    const metadataString = metadata ? JSON.stringify(metadata) : null;

    const notification = await this.notificationRepository.create({
      employeeCode,
      title,
      message,
      type,
      entityType,
      entityId,
      metadata: metadataString,
      isRead: false,
    });

    // Parse metadata back to object for consistency
    if (notification.metadata && typeof notification.metadata === 'string') {
      try {
        notification.metadata = JSON.parse(notification.metadata);
      } catch (error) {
        console.error('Error parsing notification metadata:', error);
      }
    }

    // Send realtime notification via WebSocket
    this.sendRealtimeNotification(employeeCode, notification);

    // Invalidate cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX, employeeCode),
    );

    return notification;
  }

  async getNotifications(
    employeeCode: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
  ) {
    const cacheKey = this.cacheService.generateListKey(
      this.CACHE_PREFIX,
      JSON.stringify({ employeeCode, page, limit, isRead }),
    );

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.notificationRepository.findByEmployeeCode(
      employeeCode,
      page,
      limit,
      isRead,
    );

    // Parse metadata from JSON string back to object for all notifications
    result.data = result.data.map((notification) => {
      if (notification.metadata && typeof notification.metadata === 'string') {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (error) {
          console.error('Error parsing notification metadata:', error);
        }
      }
      return notification;
    });

    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async markAsRead(
    notificationId: number,
    employeeCode: string,
  ): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId, employeeCode);

    // Invalidate cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX, employeeCode),
    );
  }

  async markAllAsRead(employeeCode: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(employeeCode);

    // Invalidate cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX, employeeCode),
    );
  }

  async getUnreadCount(employeeCode: string): Promise<number> {
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      `unread:${employeeCode}`,
    );

    const cached = await this.cacheService.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count =
      await this.notificationRepository.getUnreadCount(employeeCode);
    await this.cacheService.set(cacheKey, count, this.CACHE_TTL);

    return count;
  }

  private sendRealtimeNotification(
    employeeCode: string,
    notification: Notification,
  ): void {
    // Find WebSocket client by employee code
    const clients = this.websocketUtil['clients'] as Map<string, any>;
    let targetClient = null;

    for (const [, client] of clients.entries()) {
      if (client.employeeCode === employeeCode) {
        targetClient = client;
        break;
      }
    }

    if (targetClient) {
      console.log(
        `📨 Sending notification to employee ${employeeCode}:`,
        notification.title,
      );
      this.websocketUtil.sendTo(targetClient.id, {
        type: 'notification',
        data: {
          notification,
          unreadCount: this.getUnreadCount(employeeCode),
        },
      });
    } else {
      console.log(`⚠️ No WebSocket client found for employee ${employeeCode}`);
    }
  }

  // Helper methods for creating specific notification types
  async createApprovalCreatedNotification(
    approvalId: number,
    approvalTitle: string,
    creatorEmployeeCode: string,
    creatorName: string,
    relatedEmployeeCodes: string[],
  ): Promise<void> {
    const title = 'มีการสร้างรายการอนุมัติใหม่';
    const message = `รายการ "${approvalTitle}" ถูกสร้างโดย ${creatorName}`;
    const metadata = {
      approvalId,
      approvalTitle,
      creatorEmployeeCode,
      creatorName,
    };

    // Create notifications for all related employees
    for (const employeeCode of relatedEmployeeCodes) {
      if (employeeCode !== creatorEmployeeCode) {
        await this.createNotification(
          employeeCode,
          title,
          message,
          NotificationType.APPROVAL_CREATED,
          EntityType.APPROVAL,
          approvalId,
          metadata,
        );
      }
    }
  }

  async createApprovalStatusChangedNotification(
    approvalId: number,
    approvalTitle: string,
    status: 'APPROVED' | 'REJECTED',
    employeeCode: string,
    approverName: string,
  ): Promise<void> {
    const title =
      status === 'APPROVED'
        ? 'รายการอนุมัติได้รับการอนุมัติ'
        : 'รายการอนุมัติถูกปฏิเสธ';
    const message = `รายการ "${approvalTitle}" ${status === 'APPROVED' ? 'ได้รับการอนุมัติ' : 'ถูกปฏิเสธ'} โดย ${approverName}`;
    const type =
      status === 'APPROVED'
        ? NotificationType.APPROVAL_APPROVED
        : NotificationType.APPROVAL_REJECTED;
    const metadata = {
      approvalId,
      approvalTitle,
      status,
      approverName,
    };

    await this.createNotification(
      employeeCode,
      title,
      message,
      type,
      EntityType.APPROVAL,
      approvalId,
      metadata,
    );
  }

  async createReportCreatedNotification(
    reportId: number,
    reportTitle: string,
    creatorEmployeeCode: string,
    relatedEmployeeCodes: string[],
  ): Promise<void> {
    const title = 'มีการสร้างรายงานใหม่';
    const message = `รายงาน "${reportTitle}" ถูกสร้างโดย ${creatorEmployeeCode}`;
    const metadata = {
      reportId,
      reportTitle,
      creatorEmployeeCode,
    };

    // Create notifications for all related employees
    for (const employeeCode of relatedEmployeeCodes) {
      if (employeeCode !== creatorEmployeeCode) {
        await this.createNotification(
          employeeCode,
          title,
          message,
          NotificationType.REPORT_CREATED,
          EntityType.REPORT,
          reportId,
          metadata,
        );
      }
    }
  }
}
