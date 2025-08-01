export class EmployeeAdmin {
  id: number;
  pmt_code: string;
  employee_code: string;
  employee_name: string;
  position?: string;
  department?: string;
  division?: string;
  section?: string;
  is_active: boolean;
  is_suspended: boolean;
  suspended_until?: Date;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
} 