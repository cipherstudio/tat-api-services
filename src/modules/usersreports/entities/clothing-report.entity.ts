export class ClothingReport {
  id: number;
  clothingFileChecked: boolean;
  clothingAmount: number;
  clothingReason: string;
  reportingDate: string;
  nextClaimDate: string;
  workEndDate: string;
  createdAt: Date;
  updatedAt: Date;
  staffMemberId: number;
  approvalId: number;
  employeeCode: number;
  incrementId: string;
  destinationCountry: string;
  
  // From approval table
  approvalIncrementId?: string; // renamed from incrementId to avoid conflict
  documentTitle?: string;
  approvalDate?: string;
  createdEmployeeCode?: string;
  createdEmployeeName?: string;
  
  // From EMPLOYEE table
  employeeName?: string;
  
  // From approval_date_ranges table (array of date ranges)
  approvalDateRanges?: Array<{
    startDate: string;
    endDate: string;
  }>;
} 