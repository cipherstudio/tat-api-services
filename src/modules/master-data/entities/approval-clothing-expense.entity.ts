export class ApprovalClothingExpense {
  id: number;
  clothing_file_checked: boolean;
  clothing_amount: number;
  clothing_reason: string;
  reporting_date: string;
  next_claim_date: string;
  work_start_date: string;
  work_end_date: string;
  created_at: Date;
  updated_at: Date;
  //approval_accommodation_expense_id: number;
  staff_member_id: number;
  approval_id: number;
  employee_code: number;
  increment_id: string;
  destination_country: string;
  
  // Additional fields from joins
  employee_pmt_code?: string;
  employee_name_th?: string;
  employee_name_en?: string;
  employee_position?: string;
  employee_faculty?: string;
  employee_email?: string;
  approval_travel_type?: string;
}
