export interface VTxOt {
  budYear?: Date;
  sectionCode?: string;
  sectionName?: string;
  outputPlanCode?: string;
  outputPlanDesc?: string;
  activitySubCode?: string;
  activitySubDesc?: string;
  budgetCode?: string;
  amountCf?: number;
}

export const vTxOtColumnMap = {
  budYear: 'BUD_YEAR',
  sectionCode: 'SECTION_CODE',
  sectionName: 'SECTION_NAME',
  outputPlanCode: 'OUTPUT_PLAN_CODE',
  outputPlanDesc: 'OUTPUT_PLAN_DESC',
  activitySubCode: 'ACTIVITY_SUB_CODE',
  activitySubDesc: 'ACTIVITY_SUB_DESC',
  budgetCode: 'BUDGET_CODE',
  amountCf: 'AMOUNT_CF',
};

export const vTxOtReverseColumnMap = vTxOtColumnMap;

export type VTxOtPaginate = {
  data: VTxOt[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
