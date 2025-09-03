export interface VTxTattras {
  budYear?: string;
  sectionCode?: string;
  sectionName?: string;
  overviewStrategyId?: string;
  overviewStrategyNameTh?: string;
  activitySubCode?: string;
  activitySubDesc?: string;
  outputPlanCode?: string;
  outputPlanDesc?: string;
  budgetCode?: string;
  amountCf?: number;
}

export const vTxTattrasColumnMap = {
  budYear: 'BUD_YEAR',
  sectionCode: 'SECTION_CODE',
  sectionName: 'SECTION_NAME',
  overviewStrategyId: 'OVERVIEW_STRATEGY_ID',
  overviewStrategyNameTh: 'OVERVIEW_STRATEGY_NAME_TH',
  activitySubCode: 'ACTIVITY_SUB_CODE',
  activitySubDesc: 'ACTIVITY_SUB_DESC',
  outputPlanCode: 'OUTPUT_PLAN_CODE',
  outputPlanDesc: 'OUTPUT_PLAN_DESC',
  budgetCode: 'BUDGET_CODE',
  amountCf: 'AMOUNT_CF',
};

export const vTxTattrasReverseColumnMap = vTxTattrasColumnMap;

export type VTxTattrasPaginate = {
  data: VTxTattras[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
