import { Injectable, NotFoundException } from '@nestjs/common';
import { MeetingExpenseReportRepository } from '../repositories/meeting-expense-report.repository';
import { MeetingTypeRepository } from '../repositories/meeting-type.repository';
import { MeetingTypeRateRepository } from '../repositories/meeting-type-rate.repository';
import { CreateMeetingExpenseReportDto } from '../dto/create-meeting-expense-report.dto';
import { UpdateMeetingExpenseReportDto } from '../dto/update-meeting-expense-report.dto';
import { MeetingExpenseReportQueryDto } from '../dto/meeting-expense-report-query.dto';
import { MeetingExpenseReport } from '../entities/meeting-expense-report.entity';

@Injectable()
export class MeetingExpenseReportService {
  constructor(
    private readonly meetingExpenseReportRepo: MeetingExpenseReportRepository,
    private readonly meetingTypeRepo: MeetingTypeRepository,
    private readonly meetingTypeRateRepo: MeetingTypeRateRepository,
  ) {}

  async findAll(query: MeetingExpenseReportQueryDto, employeeCode?: string) {
    return this.meetingExpenseReportRepo.findWithPaginationAndSearch(query, employeeCode);
  }

  async findById(id: number, employeeCode?: string) {
    const report = await this.meetingExpenseReportRepo.findByIdWithDetails(id, employeeCode);
    if (!report) {
      throw new NotFoundException('Meeting expense report not found');
    }
    return report;
  }

  async create(createDto: CreateMeetingExpenseReportDto) {
    const { foodRows, snackRows, ...reportData } = createDto;

    // Calculate total amount if not provided
    if (!reportData.totalAmount) {
      const foodTotal = foodRows
        .filter((row) => row.checked)
        .reduce((sum, row) => sum + (row.amount || 0), 0);
      const snackTotal = snackRows
        .filter((row) => row.checked)
        .reduce((sum, row) => sum + (row.amount || 0), 0);
      reportData.totalAmount = foodTotal + snackTotal;
    }

    // Create report
    const report = await this.meetingExpenseReportRepo.create({
      ...reportData,
      meetingDate: new Date(reportData.meetingDate),
    });

    // Create food rows with proper column mapping
    if (foodRows && foodRows.length > 0) {
      const foodRowsData = foodRows.map((row) => ({
        meal_type: row.mealType, // camelCase -> snake_case
        meal_name: row.mealName,
        checked: row.checked,
        rate: row.rate,
        amount: row.amount,
        receipt: row.receipt,
        receipt_date: row.receiptDate ? new Date(row.receiptDate) : null, // Convert string to Date object
        meeting_expense_report_id: report.id,
      }));
      await this.meetingExpenseReportRepo.knex
        .insert(foodRowsData)
        .into('meeting_expense_report_food_rows');
    }

    // Create snack rows with proper column mapping
    if (snackRows && snackRows.length > 0) {
      const snackRowsData = snackRows.map((row) => ({
        snack_type: row.snackType, // camelCase -> snake_case
        snack_name: row.snackName,
        checked: row.checked,
        rate: row.rate,
        amount: row.amount,
        receipt: row.receipt,
        receipt_date: row.receiptDate ? new Date(row.receiptDate) : null, // Convert string to Date object
        meeting_expense_report_id: report.id,
      }));
      await this.meetingExpenseReportRepo.knex
        .insert(snackRowsData)
        .into('meeting_expense_report_snack_rows');
    }

    return this.findById(report.id);
  }

  async update(id: number, updateDto: UpdateMeetingExpenseReportDto) {
    const { foodRows, snackRows, ...reportData } = updateDto;

    // Update report
    const updateData: Partial<MeetingExpenseReport> = {
      department: reportData.department,
      section: reportData.section,
      job: reportData.job,
      employeeId: reportData.employeeId,
      name: reportData.name,
      position: reportData.position,
      topic: reportData.topic,
      place: reportData.place,
      meetingType: reportData.meetingType,
      chairman: reportData.chairman,
      attendees: reportData.attendees,
      totalAmount: reportData.totalAmount,
      status: reportData.status,
      statusDescription: reportData.statusDescription,
    };

    if (reportData.meetingDate) {
      updateData.meetingDate = new Date(reportData.meetingDate);
    }

    await this.meetingExpenseReportRepo.update(id, updateData);

    // Update food rows if provided
    if (foodRows) {
      // Delete existing food rows
      await this.meetingExpenseReportRepo.knex
        .delete()
        .from('meeting_expense_report_food_rows')
        .where('meeting_expense_report_id', id);

      // Insert new food rows with proper column mapping
      if (foodRows.length > 0) {
        const foodRowsData = foodRows.map((row) => ({
          meal_type: row.mealType, // camelCase -> snake_case
          meal_name: row.mealName,
          checked: row.checked,
          rate: row.rate,
          amount: row.amount,
          receipt: row.receipt,
          receipt_date: row.receiptDate ? new Date(row.receiptDate) : null, // Convert string to Date object
          meeting_expense_report_id: id,
        }));
        await this.meetingExpenseReportRepo.knex
          .insert(foodRowsData)
          .into('meeting_expense_report_food_rows');
      }
    }

    // Update snack rows if provided
    if (snackRows) {
      // Delete existing snack rows
      await this.meetingExpenseReportRepo.knex
        .delete()
        .from('meeting_expense_report_snack_rows')
        .where('meeting_expense_report_id', id);

      // Insert new snack rows with proper column mapping
      if (snackRows.length > 0) {
        const snackRowsData = snackRows.map((row) => ({
          snack_type: row.snackType, // camelCase -> snake_case
          snack_name: row.snackName,
          checked: row.checked,
          rate: row.rate,
          amount: row.amount,
          receipt: row.receipt,
          receipt_date: row.receiptDate ? new Date(row.receiptDate) : null, // Convert string to Date object
          meeting_expense_report_id: id,
        }));
        await this.meetingExpenseReportRepo.knex
          .insert(snackRowsData)
          .into('meeting_expense_report_snack_rows');
      }
    }

    return this.findById(id);
  }

  async updateStatus(
    id: number,
    status: string,
    statusDescription?: string,
    updatedBy?: string,
  ) {
    await this.meetingExpenseReportRepo.updateStatus(
      id,
      status,
      statusDescription,
      updatedBy,
    );
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.meetingExpenseReportRepo.update(id, {
      deletedAt: new Date(),
    });
    return { message: 'Meeting expense report deleted successfully' };
  }

  async getMeetingTypes() {
    return this.meetingTypeRepo.findActive();
  }

  async getMeetingTypeRates(meetingTypeId?: number, date?: string) {
    if (meetingTypeId && date) {
      return this.meetingTypeRateRepo.findByMeetingTypeAndDate(
        meetingTypeId,
        date,
      );
    }
    return this.meetingTypeRateRepo.findActiveRates();
  }
}
