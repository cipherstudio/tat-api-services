import { Injectable } from '@nestjs/common';
import { ClothingExpenseCancellationRequestRepository } from '../repositories/clothing-expense-cancellation-request.repository';
import { CreateClothingExpenseCancellationRequestDto } from '../dto/create-clothing-expense-cancellation-request.dto';
import { UpdateClothingExpenseCancellationRequestDto } from '../dto/update-clothing-expense-cancellation-request.dto';
import { ClothingExpenseCancellationRequestQueryDto } from '../dto/clothing-expense-cancellation-request-query.dto';
import { ClothingExpenseCancellationRequest } from '../entities/clothing-expense-cancellation-request.entity';
import { NotificationService } from '../../notification/notification.service';
import {
  NotificationType,
  EntityType,
} from '../../notification/entities/notification.entity';
import { UserRepository } from '../../users/repositories/user.repository';

@Injectable()
export class ClothingExpenseCancellationRequestService {
  constructor(
    private readonly clothingExpenseCancellationRequestRepository: ClothingExpenseCancellationRequestRepository,
    private readonly notificationService: NotificationService,
    private readonly userRepository: UserRepository,
  ) {}

  // หาพนักงานที่ถูกยกเลิกค่าเครื่องแต่งตัว จาก approval_staff_members
  // (selected_staff_ids คือ approval_staff_members.id — ตาม pattern เดียวกับ
  // ClothingExpenseCancellationRequestRepository.resolveCancelledStaffName)
  private async getCancelledStaffInfo(
    approvalId?: number,
    selectedStaffIds?: (number | string)[],
  ): Promise<{ employeeCode: string; name: string } | null> {
    if (!approvalId || !selectedStaffIds || selectedStaffIds.length === 0) {
      return null;
    }

    const idStrings = selectedStaffIds.map((id) => String(id));
    const numericIds = idStrings
      .map((id) => Number(id))
      .filter((n) => !Number.isNaN(n));

    const baseQuery = this.clothingExpenseCancellationRequestRepository
      .knex('approval_staff_members')
      .where('approval_id', approvalId)
      .select('name', 'employee_code');

    let row =
      numericIds.length > 0
        ? await baseQuery.clone().whereIn('id', numericIds).first()
        : null;

    if (!row) {
      row = await baseQuery.clone().whereIn('employee_code', idStrings).first();
    }

    if (!row?.name) return null;

    // คณะกรรมการ/บุคคลภายนอก อาจมี employee_code เป็น UUID placeholder (ไม่ใช่รหัสพนักงานจริง) — ไม่มี login ในระบบ ไม่ต้องแจ้งเตือน
    const employeeCode =
      row.employee_code && /^\d+$/.test(String(row.employee_code))
        ? String(row.employee_code)
        : '';

    return { employeeCode, name: row.name };
  }

  async findAll(
    query: ClothingExpenseCancellationRequestQueryDto,
    currentEmployeeId?: number,
  ) {
    const { page, limit, order_by, direction, ...conditions } = query;

    return this.clothingExpenseCancellationRequestRepository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      order_by,
      direction,
      currentEmployeeId,
    );
  }

  async findOne(
    id: number,
  ): Promise<ClothingExpenseCancellationRequest | null> {
    return this.clothingExpenseCancellationRequestRepository.findOne({ id });
  }

  async create(
    dto: CreateClothingExpenseCancellationRequestDto,
  ): Promise<ClothingExpenseCancellationRequest> {
    const data: any = {
      approval_id: dto.approval_id,
      attachment_id: dto.attachment_id,
      comment: dto.comment,
      creator_code: dto.creator_code,
      creator_name: dto.creator_name,
      status: dto.status || 'pending',
      selected_staff_ids: dto.selected_staff_ids
        ? JSON.stringify(dto.selected_staff_ids)
        : null,
    };
    const created =
      await this.clothingExpenseCancellationRequestRepository.create(data);

    // #417 — แจ้งเตือน admin ทุกคนเมื่อมีรายการขอยกเลิกค่าเครื่องแต่งตัวใหม่
    const cancelledStaff = await this.getCancelledStaffInfo(
      dto.approval_id,
      dto.selected_staff_ids,
    );
    const cancelledStaffName = cancelledStaff?.name || '';
    const admins = await this.userRepository.findActiveAdmins();

    const title = 'มีรายการขอยกเลิกค่าเครื่องแต่งตัว';
    const message = `ขอยกเลิกค่าเครื่องแต่งตัวของ ${cancelledStaffName} โดย ${dto.creator_name}`;

    for (const admin of admins) {
      if (admin.employeeCode) {
        await this.notificationService.createNotification(
          admin.employeeCode,
          title,
          message,
          NotificationType.CLOTHING_CANCELLATION_CREATED,
          EntityType.CLOTHING_CANCELLATION,
          created.id,
          {
            approvalId: dto.approval_id,
            creatorCode: dto.creator_code,
            creatorName: dto.creator_name,
            cancelledStaffName,
          },
        );
      }
    }

    return created;
  }

  async update(
    id: number,
    dto: UpdateClothingExpenseCancellationRequestDto,
  ): Promise<ClothingExpenseCancellationRequest> {
    // ดึงข้อมูลเดิมก่อน
    const existingRecord =
      await this.clothingExpenseCancellationRequestRepository.findOne({ id });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    const data: any = {};

    if (dto.approval_id !== undefined) data.approval_id = dto.approval_id;
    if (dto.attachment_id !== undefined) data.attachment_id = dto.attachment_id;
    if (dto.comment !== undefined) data.comment = dto.comment;
    if (dto.creator_code !== undefined) data.creator_code = dto.creator_code;
    if (dto.creator_name !== undefined) data.creator_name = dto.creator_name;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.selected_staff_ids !== undefined) {
      data.selected_staff_ids = dto.selected_staff_ids
        ? JSON.stringify(dto.selected_staff_ids)
        : null;
    }
    if (dto.approved_by_code !== undefined)
      data.approved_by_code = dto.approved_by_code;
    if (dto.approved_by_name !== undefined)
      data.approved_by_name = dto.approved_by_name;

    // #259.2 — บันทึกตัวตน + เวลา ของแอดมินที่กดอนุมัติยกเลิก
    if (dto.status === 'approved') {
      data.approved_at = new Date();
    }

    const updatedRecord =
      await this.clothingExpenseCancellationRequestRepository.update(id, data);

    const approvalId = dto.approval_id || existingRecord.approval_id;
    const selectedStaffIds: (number | string)[] =
      dto.selected_staff_ids ||
      (existingRecord.selected_staff_ids
        ? JSON.parse(existingRecord.selected_staff_ids as unknown as string)
        : []);

    if (
      dto.status === 'approved' &&
      approvalId &&
      selectedStaffIds.length > 0
    ) {
      const idStrings = selectedStaffIds.map((id) => String(id));
      const numericIds = idStrings
        .map((id: string) => Number(id))
        .filter((n: number) => !Number.isNaN(n));

      const now = new Date();
      const softDeleteData = {
        is_cancelled: true,
        cancelled_at: now,
        cancellation_request_id: id,
      };

      const baseQuery = this.clothingExpenseCancellationRequestRepository
        .knex('approval_clothing_expense')
        .where('approval_id', approvalId)
        .where('is_cancelled', false);

      let updatedCount = 0;
      if (numericIds.length > 0) {
        updatedCount = await baseQuery
          .clone()
          .whereIn('staff_member_id', numericIds)
          .update(softDeleteData);
      }
      if (updatedCount === 0) {
        await baseQuery
          .clone()
          .whereIn('employee_code', idStrings)
          .update(softDeleteData);
      }
    }

    // #416 — แจ้งเตือนผู้ทำรายการยกเลิก และผู้ที่ถูกยกเลิกค่าเครื่องแต่งตัว เมื่อรายการถูกอนุมัติ/ปฏิเสธ
    if (dto.status === 'approved' || dto.status === 'rejected') {
      const cancelledStaff = await this.getCancelledStaffInfo(
        approvalId,
        selectedStaffIds,
      );
      const cancelledStaffName = cancelledStaff?.name || '';

      const isApproved = dto.status === 'approved';
      const title = isApproved
        ? 'รายการยกเลิกค่าเครื่องแต่งตัวได้รับการอนุมัติ'
        : 'รายการยกเลิกค่าเครื่องแต่งตัวถูกปฏิเสธ';
      const message = isApproved
        ? `รายการยกเลิกค่าเครื่องแต่งตัว ของ ${cancelledStaffName} ได้รับการอนุมัติแล้ว`
        : `รายการยกเลิกค่าเครื่องแต่งตัว ของ ${cancelledStaffName} ถูกปฏิเสธ`;
      const notificationType = isApproved
        ? NotificationType.CLOTHING_CANCELLATION_APPROVED
        : NotificationType.CLOTHING_CANCELLATION_REJECTED;

      const recipients = new Set<string>();
      if (existingRecord.creator_code)
        recipients.add(existingRecord.creator_code);
      if (cancelledStaff?.employeeCode)
        recipients.add(cancelledStaff.employeeCode);

      for (const employeeCode of recipients) {
        await this.notificationService.createNotification(
          employeeCode,
          title,
          message,
          notificationType,
          EntityType.CLOTHING_CANCELLATION,
          id,
          { approvalId, cancelledStaffName, status: dto.status },
        );
      }
    }

    return updatedRecord;
  }

  async remove(id: number): Promise<void> {
    await this.clothingExpenseCancellationRequestRepository.delete(id);
  }
}
