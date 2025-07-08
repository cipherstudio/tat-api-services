import { ApiProperty } from '@nestjs/swagger';

export interface Approval {
  /**
   * The unique identifier for the approval
   */
  id: number;

  /**
   * The user ID who created the approval
   */
  userId: number;

  /**
   * The increment ID
   */
  incrementId: string;

  /**
   * The approval reference
   */
  approvalRef?: number;

  /**
   * The record type
   */
  recordType?: string;

  /**
   * The name
   */
  name: string;

  /**
   * The employee code
   */
  employeeCode?: string;

  /**
   * The travel type
   */
  travelType?: string;

  /**
   * The international sub option
   */
  internationalSubOption?: string;

  /**
   * The work start date
   */
  workStartDate?: string;

  /**
   * The work end date
   */
  workEndDate?: string;

  /**
   * The start country
   */
  startCountry?: string;

  /**
   * The end country
   */
  endCountry?: string;

  /**
   * The remarks
   */
  remarks?: string;

  /**
   * The number of travelers
   */
  numTravelers?: string;

  /**
   * The document number
   */
  documentNo?: string;

  /**
   * The document telephone
   */
  documentTel?: string;

  /**
   * The document to
   */
  documentTo?: string;

  /**
   * The document title
   */
  documentTitle?: string;

  /**
   * The attachment ID
   */
  attachmentId?: number;

  /**
   * Form 3 total outbound amount
   */
  form3TotalOutbound?: number;

  /**
   * Form 3 total inbound amount
   */
  form3TotalInbound?: number;

  /**
   * Form 3 total amount
   */
  form3TotalAmount?: number;

  /**
   * Whether lodging rights are exceeded
   */
  exceedLodgingRightsChecked?: boolean;

  /**
   * Reason for exceeding lodging rights
   */
  exceedLodgingRightsReason?: string;

  /**
   * Form 4 total amount
   */
  form4TotalAmount?: number;

  /**
   * Form 5 total amount
   */
  form5TotalAmount?: number;

  /**
   * Confidentiality level
   */
  confidentialityLevel?: any;

  /**
   * Urgency level
   */
  urgencyLevel?: any;

  /**
   * Departments
   */
  departments?: any;

  /**
   * Degrees
   */
  degrees?: any;

  /**
   * Staff
   */
  staff?: string;

  /**
   * Staff employee code
   */
  staffEmployeeCode?: string;

  /**
   * Comments
   */
  comments?: string;

  /**
   * Approval date
   */
  approvalDate?: string;

  /**
   * Final departments
   */
  finalDepartments?: any;

  /**
   * Final degrees
   */
  finalDegrees?: any;

  /**
   * Final staff
   */
  finalStaff?: string;

  /**
   * Final staff employee code
   */
  finalStaffEmployeeCode?: string;

  /**
   * Signer date
   */
  signerDate?: string;

  /**
   * Document ending
   */
  documentEnding?: string;

  /**
   * Document ending wording
   */
  documentEndingWording?: string;

  /**
   * Signer name
   */
  signerName?: string;

  /**
   * Whether to use file signature
   */
  useFileSignature?: boolean;

  /**
   * Signature attachment ID
   */
  signatureAttachmentId?: number;

  /**
   * Whether to use system signature
   */
  useSystemSignature?: boolean;

  /**
   * Approval print number
   */
  approvalPrintNumber?: string;

  /**
   * Expense print number
   */
  expensePrintNumber?: string;

  /**
   * When the approval was created
   */
  createdAt: Date;

  /**
   * When the approval was last updated
   */
  updatedAt: Date;

  /**
   * When the approval was deleted
   */
  deletedAt?: Date;

  /**
   * The latest approval status
   */
  latestApprovalStatus?: string;

  /**
   * When the latest approval status was created
   */
  latestStatusCreatedAt?: Date;

  /**
   * Array of approval date ranges
   */
  approvalDateRanges?: Array<{
    startDate: string;
    endDate: string;
  }>;

  /**
   * Array of clothing expenses
   */
  clothingExpenses?: Array<{
    clothingFileChecked: boolean;
    clothingAmount: number;
    clothingReason: string;
    attachmentId: number;
    reportingDate: string;
    nextClaimDate: string;
    workEndDate: string;
  }>;

  /**
   * Array of budgets
   */
  approvalBudgets?: Array<{
    budgetType: string;
    itemType: string;
    reservationCode: string;
    department: string;
    budgetCode: string;
    attachmentId: string;
  }>;
}

// Snake case to camel case mapping for database results
export const approvalColumnMap = {
  id: 'id',
  user_id: 'userId',
  increment_id: 'incrementId',
  approval_ref: 'approvalRef',
  record_type: 'recordType',
  name: 'name',
  employee_code: 'employeeCode',
  travel_type: 'travelType',
  international_sub_option: 'internationalSubOption',
  work_start_date: 'workStartDate',
  work_end_date: 'workEndDate',
  start_country: 'startCountry',
  end_country: 'endCountry',
  remarks: 'remarks',
  num_travelers: 'numTravelers',
  document_no: 'documentNo',
  document_tel: 'documentTel',
  document_to: 'documentTo',
  document_title: 'documentTitle',
  attachment_id: 'attachmentId',
  form3_total_outbound: 'form3TotalOutbound',
  form3_total_inbound: 'form3TotalInbound',
  form3_total_amount: 'form3TotalAmount',
  exceed_lodging_rights_checked: 'exceedLodgingRightsChecked',
  exceed_lodging_rights_reason: 'exceedLodgingRightsReason',
  form4_total_amount: 'form4TotalAmount',
  form5_total_amount: 'form5TotalAmount',
  confidentiality_level: 'confidentialityLevel',
  urgency_level: 'urgencyLevel',
  departments: 'departments',
  degrees: 'degrees',
  staff: 'staff',
  staff_employee_code: 'staffEmployeeCode',
  comments: 'comments',
  approval_date: 'approvalDate',
  final_departments: 'finalDepartments',
  final_degrees: 'finalDegrees',
  final_staff: 'finalStaff',
  final_staff_employee_code: 'finalStaffEmployeeCode',
  signer_date: 'signerDate',
  document_ending: 'documentEnding',
  document_ending_wording: 'documentEndingWording',
  signer_name: 'signerName',
  use_file_signature: 'useFileSignature',
  signature_attachment_id: 'signatureAttachmentId',
  use_system_signature: 'useSystemSignature',
  approval_print_number: 'approvalPrintNumber',
  expense_print_number: 'expensePrintNumber',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_at: 'deletedAt',
};

// Camel case to snake case mapping for database inserts
export const approvalReverseColumnMap = {
  id: 'id',
  userId: 'user_id',
  incrementId: 'increment_id',
  approvalRef: 'approval_ref',
  recordType: 'record_type',
  name: 'name',
  employeeCode: 'employee_code',
  travelType: 'travel_type',
  internationalSubOption: 'international_sub_option',
  workStartDate: 'work_start_date',
  workEndDate: 'work_end_date',
  startCountry: 'start_country',
  endCountry: 'end_country',
  remarks: 'remarks',
  numTravelers: 'num_travelers',
  documentNo: 'document_no',
  documentTel: 'document_tel',
  documentTo: 'document_to',
  documentTitle: 'document_title',
  attachmentId: 'attachment_id',
  form3TotalOutbound: 'form3_total_outbound',
  form3TotalInbound: 'form3_total_inbound',
  form3TotalAmount: 'form3_total_amount',
  exceedLodgingRightsChecked: 'exceed_lodging_rights_checked',
  exceedLodgingRightsReason: 'exceed_lodging_rights_reason',
  form4TotalAmount: 'form4_total_amount',
  form5TotalAmount: 'form5_total_amount',
  confidentialityLevel: 'confidentiality_level',
  urgencyLevel: 'urgency_level',
  departments: 'departments',
  degrees: 'degrees',
  staff: 'staff',
  staffEmployeeCode: 'staff_employee_code',
  comments: 'comments',
  approvalDate: 'approval_date',
  finalDepartments: 'final_departments',
  finalDegrees: 'final_degrees',
  finalStaff: 'final_staff',
  finalStaffEmployeeCode: 'final_staff_employee_code',
  signerDate: 'signer_date',
  documentEnding: 'document_ending',
  documentEndingWording: 'document_ending_wording',
  signerName: 'signer_name',
  useFileSignature: 'use_file_signature',
  signatureAttachmentId: 'signature_attachment_id',
  useSystemSignature: 'use_system_signature',
  approvalPrintNumber: 'approval_print_number',
  expensePrintNumber: 'expense_print_number',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
};
