import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';

@Injectable()
export class NotificationRepository extends KnexBaseRepository<Notification> {
  constructor(knexService: KnexService) {
    super(knexService, 'notifications');
  }

  async findByEmployeeCode(
    employeeCode: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
  ): Promise<{
    data: Notification[];
    meta: { total: number; page: number; limit: number; unreadCount: number };
  }> {
    const query = this.knexService
      .knex('notifications')
      .where('employee_code', employeeCode);

    if (isRead !== undefined) {
      query.where('is_read', isRead);
    }

    const offset = (page - 1) * limit;

    const [count, data, unreadCount] = await Promise.all([
      query.clone().count('* as count').first(),
      query
        .clone()
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      this.knexService
        .knex('notifications')
        .where('employee_code', employeeCode)
        .where('is_read', false)
        .count('* as count')
        .first(),
    ]);

    return {
      data: await Promise.all(
        data.map(async (n) => await toCamelCase<Notification>(n)),
      ),
      meta: {
        total: Number(count?.count || 0),
        page,
        limit,
        unreadCount: Number(unreadCount?.count || 0),
      },
    };
  }

  async markAsRead(notificationId: number, employeeCode: string): Promise<void> {
    await this.knexService
      .knex('notifications')
      .where({ id: notificationId, employee_code: employeeCode })
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      });
  }

  async markAllAsRead(employeeCode: string): Promise<void> {
    await this.knexService
      .knex('notifications')
      .where({ employee_code: employeeCode, is_read: false })
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      });
  }

  async getUnreadCount(employeeCode: string): Promise<number> {
    const result = await this.knexService
      .knex('notifications')
      .where({ employee_code: employeeCode, is_read: false })
      .count('* as count')
      .first();

    return Number(result?.count || 0);
  }
}
