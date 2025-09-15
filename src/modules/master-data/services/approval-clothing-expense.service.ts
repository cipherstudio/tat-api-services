import { Injectable } from '@nestjs/common';
import { ApprovalClothingExpenseRepository } from '../repositories/approval-clothing-expense.repository';
import { CreateApprovalClothingExpenseDto } from '../dto/create-approval-clothing-expense.dto';
import { UpdateApprovalClothingExpenseDto } from '../dto/update-approval-clothing-expense.dto';
import { ApprovalClothingExpenseQueryDto } from '../dto/approval-clothing-expense-query.dto';
import { ApprovalClothingExpense } from '../entities/approval-clothing-expense.entity';

@Injectable()
export class ApprovalClothingExpenseService {
  constructor(
    private readonly approvalClothingExpenseRepository: ApprovalClothingExpenseRepository,
  ) {}

  async findAll(query: ApprovalClothingExpenseQueryDto) {
    const { page, limit, order_by, direction, search, ...conditions } = query;
    
    return this.approvalClothingExpenseRepository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      order_by,
      direction,
      search,
    );
  }

  async findOne(id: number): Promise<ApprovalClothingExpense | null> {
    return this.approvalClothingExpenseRepository.findOne({ id });
  }

  async create(
    dto: CreateApprovalClothingExpenseDto,
  ): Promise<ApprovalClothingExpense> {
    const data = {
      clothing_file_checked: dto.clothing_file_checked,
      clothing_amount: dto.clothing_amount,
      clothing_reason: dto.clothing_reason,
      reporting_date: dto.reporting_date,
      next_claim_date: dto.next_claim_date,
      work_start_date: dto.work_start_date,
      work_end_date: dto.work_end_date,
      //approval_accommodation_expense_id: dto.approval_accommodation_expense_id,
      staff_member_id: dto.staff_member_id,
      approval_id: dto.approval_id,
      employee_code: dto.employee_code,
      increment_id: dto.increment_id,
      destination_country: dto.destination_country,
    };
    return this.approvalClothingExpenseRepository.create(data);
  }

  async update(
    id: number,
    dto: UpdateApprovalClothingExpenseDto,
  ): Promise<ApprovalClothingExpense> {
    const data = {
      clothing_file_checked: dto.clothing_file_checked,
      clothing_amount: dto.clothing_amount,
      clothing_reason: dto.clothing_reason,
      reporting_date: dto.reporting_date,
      next_claim_date: dto.next_claim_date,
      work_start_date: dto.work_start_date,
      work_end_date: dto.work_end_date,
      //approval_accommodation_expense_id: dto.approval_accommodation_expense_id,
      staff_member_id: dto.staff_member_id,
      approval_id: dto.approval_id,
      employee_code: dto.employee_code,
      increment_id: dto.increment_id,
      destination_country: dto.destination_country,
    };
    return this.approvalClothingExpenseRepository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.approvalClothingExpenseRepository.delete(id);
  }
}
