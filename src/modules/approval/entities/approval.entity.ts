import { ApiProperty } from '@nestjs/swagger';

export interface Approval {
  /**
   * The unique identifier for the approval
   */
  id: number;

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
   * When the approval was created
   */
  createdAt: Date;

  /**
   * When the approval was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const approvalColumnMap = {
  id: 'id',
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
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const approvalReverseColumnMap = {
  id: 'id',
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
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
