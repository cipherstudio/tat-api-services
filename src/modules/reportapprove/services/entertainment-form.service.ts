import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReportEntertainmentFormRepository } from '../repositories/report-entertainment-form.repository';
import { ReportEntertainmentItemsRepository } from '../repositories/report-entertainment-items.repository';
import { EntertainmentFormStatusRepository } from '../repositories/entertainment-form-status.repository';
import { CreateEntertainmentFormDto } from '../dto/create-entertainment-form.dto';
import { UpdateEntertainmentFormDto } from '../dto/update-entertainment-form.dto';
import {
  EntertainmentFormQueryDto,
  EntertainmentFormStatus,
} from '../dto/entertainment-form-query.dto';

@Injectable()
export class EntertainmentFormService {
  constructor(
    private readonly entertainmentFormRepo: ReportEntertainmentFormRepository,
    private readonly entertainmentItemsRepo: ReportEntertainmentItemsRepository,
    private readonly entertainmentStatusRepo: EntertainmentFormStatusRepository,
  ) {}

  async findAll(query: EntertainmentFormQueryDto) {
    return this.entertainmentFormRepo.findWithPaginationAndSearch(query);
  }

  async findOne(id: number) {
    return this.entertainmentFormRepo.findByIdWithDetails(id);
  }

  async create(dto: CreateEntertainmentFormDto) {
    // if (dto.statusId) {
    const status = await this.entertainmentStatusRepo.findById(
      EntertainmentFormStatus.DRAFT,
    );
    if (!status) {
      throw new BadRequestException(`Invalid status ID: ${status}`);
    }
    // }

    // Calculate total amount from items
    if (dto.items && dto.items.length > 0) {
      const totalAmount = dto.items.reduce(
        (sum, item) => sum + (item.amount || 0),
        0,
      );
      dto.totalAmount = totalAmount;
    }

    dto.items.forEach((item) => {
      item.eventDate = this.toOracleDate(item.eventDate);
    });

    return this.entertainmentFormRepo.create(dto);
  }

  async update(id: number, dto: UpdateEntertainmentFormDto) {
    // Check if form exists
    const existingForm = await this.entertainmentFormRepo.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Entertainment form with ID ${id} not found`);
    }

    // Validate status if provided
    if (dto.statusId) {
      const status = await this.entertainmentStatusRepo.findById(dto.statusId);
      if (!status) {
        throw new BadRequestException(`Invalid status ID: ${dto.statusId}`);
      }
    }

    // Calculate total amount from items if provided
    if (dto.items && dto.items.length > 0) {
      const totalAmount = dto.items.reduce(
        (sum, item) => sum + (item.amount || 0),
        0,
      );
      dto.totalAmount = totalAmount;
    }

    return this.entertainmentFormRepo.update(id, dto);
  }

  async updateStatus(
    id: number,
    statusId: EntertainmentFormStatus,
    approvedBy?: string,
    approvedComment?: string,
  ) {
    // Check if form exists
    const existingForm = await this.entertainmentFormRepo.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Entertainment form with ID ${id} not found`);
    }

    // Validate status
    const status = await this.entertainmentStatusRepo.findById(statusId);
    if (!status) {
      throw new BadRequestException(`Invalid status ID: ${statusId}`);
    }

    // Validate status transition
    this.validateStatusTransition(existingForm.statusId, statusId);

    return this.entertainmentFormRepo.updateStatus(
      id,
      statusId,
      approvedBy,
      approvedComment,
    );
  }

  async remove(id: number) {
    // Check if form exists
    const existingForm = await this.entertainmentFormRepo.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Entertainment form with ID ${id} not found`);
    }

    // Check if form can be deleted (only draft status)
    if (existingForm.statusId !== EntertainmentFormStatus.DRAFT) {
      throw new BadRequestException('Only draft forms can be deleted');
    }

    // Delete items first (CASCADE should handle this, but being explicit)
    await this.entertainmentItemsRepo.deleteByReportId(id);

    // Delete main form
    return this.entertainmentFormRepo.delete(id);
  }

  async getStatuses() {
    return this.entertainmentStatusRepo.findAll();
  }

  async calculateTotalAmount(id: number) {
    // Check if form exists
    const existingForm = await this.entertainmentFormRepo.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Entertainment form with ID ${id} not found`);
    }

    return this.entertainmentFormRepo.calculateTotalAmount(id);
  }

  async getItemsByReportId(reportId: number) {
    // Check if form exists
    const existingForm = await this.entertainmentFormRepo.findById(reportId);
    if (!existingForm) {
      throw new NotFoundException(
        `Entertainment form with ID ${reportId} not found`,
      );
    }

    return this.entertainmentItemsRepo.findByReportId(reportId);
  }

  private validateStatusTransition(currentStatus: number, newStatus: number) {
    const validTransitions: Record<number, number[]> = {
      [EntertainmentFormStatus.DRAFT]: [
        EntertainmentFormStatus.PENDING,
        EntertainmentFormStatus.CANCELLED,
      ],
      [EntertainmentFormStatus.PENDING]: [
        EntertainmentFormStatus.APPROVED,
        EntertainmentFormStatus.REJECTED,
        EntertainmentFormStatus.CANCELLED,
      ],
      [EntertainmentFormStatus.APPROVED]: [],
      [EntertainmentFormStatus.REJECTED]: [
        EntertainmentFormStatus.PENDING,
        EntertainmentFormStatus.CANCELLED,
      ],
      [EntertainmentFormStatus.CANCELLED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  toOracleDate(date: Date | string) {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string' && date.length >= 10) {
      // '2025-07-02' => new Date('2025-07-02T00:00:00Z')
      return new Date(date.slice(0, 10) + 'T00:00:00Z');
    }
    return new Date(date);
  }
}
