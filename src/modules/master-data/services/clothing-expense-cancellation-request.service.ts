import { Injectable } from '@nestjs/common';
import { ClothingExpenseCancellationRequestRepository } from '../repositories/clothing-expense-cancellation-request.repository';
import { CreateClothingExpenseCancellationRequestDto } from '../dto/create-clothing-expense-cancellation-request.dto';
import { UpdateClothingExpenseCancellationRequestDto } from '../dto/update-clothing-expense-cancellation-request.dto';
import { ClothingExpenseCancellationRequestQueryDto } from '../dto/clothing-expense-cancellation-request-query.dto';
import { ClothingExpenseCancellationRequest } from '../entities/clothing-expense-cancellation-request.entity';

@Injectable()
export class ClothingExpenseCancellationRequestService {
  constructor(
    private readonly clothingExpenseCancellationRequestRepository: ClothingExpenseCancellationRequestRepository,
  ) {}

  async findAll(query: ClothingExpenseCancellationRequestQueryDto, currentEmployeeId?: number) {
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

  async findOne(id: number): Promise<ClothingExpenseCancellationRequest | null> {
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
      selected_staff_ids: dto.selected_staff_ids ? JSON.stringify(dto.selected_staff_ids) : null,
    };
    return this.clothingExpenseCancellationRequestRepository.create(data);
  }

  async update(
    id: number,
    dto: UpdateClothingExpenseCancellationRequestDto,
  ): Promise<ClothingExpenseCancellationRequest> {
    // ดึงข้อมูลเดิมก่อน
    const existingRecord = await this.clothingExpenseCancellationRequestRepository.findOne({ id });
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
      data.selected_staff_ids = dto.selected_staff_ids ? JSON.stringify(dto.selected_staff_ids) : null;
    }
    if (dto.approved_by_code !== undefined) data.approved_by_code = dto.approved_by_code;
    if (dto.approved_by_name !== undefined) data.approved_by_name = dto.approved_by_name;

    // #259.2 — บันทึกตัวตน + เวลา ของแอดมินที่กดอนุมัติยกเลิก
    if (dto.status === 'approved') {
      data.approved_at = new Date();
    }

    const updatedRecord = await this.clothingExpenseCancellationRequestRepository.update(id, data);

    if (dto.status === 'approved') {
      const approvalId = dto.approval_id || existingRecord.approval_id;
      const selectedStaffIds = dto.selected_staff_ids ||
        (existingRecord.selected_staff_ids ? JSON.parse(existingRecord.selected_staff_ids as unknown as string) : []);

      if (approvalId && selectedStaffIds && selectedStaffIds.length > 0) {
        const idStrings = selectedStaffIds.map((id: number | string) => String(id));
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

        if (numericIds.length > 0) {
          const updatedByStaffMemberId = await baseQuery
            .clone()
            .whereIn('staff_member_id', numericIds)
            .update(softDeleteData);
          if (updatedByStaffMemberId > 0) {
            return updatedRecord;
          }
        }

        await baseQuery.clone().whereIn('employee_code', idStrings).update(softDeleteData);
      }
    }

    return updatedRecord;
  }

  async remove(id: number): Promise<void> {
    await this.clothingExpenseCancellationRequestRepository.delete(id);
  }
}
