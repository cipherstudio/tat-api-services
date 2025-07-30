import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmployeeAdminRepository } from '../repositories/employee-admin.repository';
import { EmployeeAdmin } from '../entities/employee-admin.entity';
import { CreateEmployeeAdminDto } from '../dto/create-employee-admin.dto';
import { UpdateEmployeeAdminDto } from '../dto/update-employee-admin.dto';
import { QueryEmployeeAdminDto } from '../dto/query-employee-admin.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class EmployeeAdminService {
  constructor(
    private readonly employeeAdminRepository: EmployeeAdminRepository,
  ) {}

  async create(createDto: CreateEmployeeAdminDto): Promise<EmployeeAdmin> {
    // ตรวจสอบว่า PMT_CODE ซ้ำหรือไม่
    const existingByPmtCode = await this.employeeAdminRepository.findByPmtCode(
      createDto.pmt_code,
    );
    if (existingByPmtCode) {
      throw new ConflictException('PMT_CODE already exists');
    }

    // ตรวจสอบว่า Employee Code ซ้ำหรือไม่
    const existingByEmployeeCode =
      await this.employeeAdminRepository.findByEmployeeCode(
        createDto.employee_code,
      );
    if (existingByEmployeeCode) {
      throw new ConflictException('Employee Code already exists');
    }

    return await this.employeeAdminRepository.create(createDto);
  }

  async findAll(
    query: QueryEmployeeAdminDto,
  ): Promise<PaginatedResult<EmployeeAdmin>> {
    return await this.employeeAdminRepository.findWithPaginationAndSearch(
      query,
    );
  }

  async findOne(id: number): Promise<EmployeeAdmin> {
    const employeeAdmin = await this.employeeAdminRepository.findById(id);
    if (!employeeAdmin) {
      throw new NotFoundException('Employee Admin not found');
    }
    return employeeAdmin;
  }

  async findByPmtCode(pmtCode: string): Promise<EmployeeAdmin> {
    const employeeAdmin =
      await this.employeeAdminRepository.findByPmtCode(pmtCode);
    if (!employeeAdmin) {
      throw new NotFoundException('Employee Admin not found');
    }
    return employeeAdmin;
  }

  async findByEmployeeCode(employeeCode: string): Promise<EmployeeAdmin> {
    const employeeAdmin =
      await this.employeeAdminRepository.findByEmployeeCode(employeeCode);
    if (!employeeAdmin) {
      throw new NotFoundException('Employee Admin not found');
    }
    return employeeAdmin;
  }

  async findActiveEmployees(): Promise<EmployeeAdmin[]> {
    return await this.employeeAdminRepository.findActiveEmployees();
  }

  async findActiveNonSuspendedEmployees(): Promise<EmployeeAdmin[]> {
    return await this.employeeAdminRepository.findActiveNonSuspendedEmployees();
  }

  async update(
    id: number,
    updateDto: UpdateEmployeeAdminDto,
  ): Promise<EmployeeAdmin> {
    const existing = await this.findOne(id);

    // ตรวจสอบ PMT_CODE ซ้ำ (ถ้ามีการเปลี่ยนแปลง)
    if (updateDto.pmt_code && updateDto.pmt_code !== existing.pmt_code) {
      const existingByPmtCode =
        await this.employeeAdminRepository.findByPmtCode(updateDto.pmt_code);
      if (existingByPmtCode && existingByPmtCode.id !== id) {
        throw new ConflictException('PMT_CODE already exists');
      }
    }

    // ตรวจสอบ Employee Code ซ้ำ (ถ้ามีการเปลี่ยนแปลง)
    if (
      updateDto.employee_code &&
      updateDto.employee_code !== existing.employee_code
    ) {
      const existingByEmployeeCode =
        await this.employeeAdminRepository.findByEmployeeCode(
          updateDto.employee_code,
        );
      if (existingByEmployeeCode && existingByEmployeeCode.id !== id) {
        throw new ConflictException('Employee Code already exists');
      }
    }

    return await this.employeeAdminRepository.update(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Employee Admin not found');
    }
    await this.employeeAdminRepository.softDelete(id);
  }

  async suspendEmployee(
    id: number,
    suspendedUntil: Date,
    updatedBy: string,
  ): Promise<void> {
    await this.findOne(id); // ตรวจสอบว่ามีอยู่จริง
    await this.employeeAdminRepository.suspendEmployee(
      id,
      suspendedUntil,
      updatedBy,
    );
  }

  async activateEmployee(id: number, updatedBy: string): Promise<void> {
    await this.findOne(id); // ตรวจสอบว่ามีอยู่จริง
    await this.employeeAdminRepository.activateEmployee(id, updatedBy);
  }
}
