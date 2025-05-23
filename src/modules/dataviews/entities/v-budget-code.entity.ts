export interface VBudgetCode {
  budgetCode?: string;
  description?: string;
  typeBudget?: string;
  typeCalendar?: string;
  dateUpdate?: Date;
  timeUpdate?: string;
  flagBudget?: number;
  typeCodeBudget?: string;
  receiveGroup?: string;
  flagAlert?: number;
}

export const vBudgetCodeColumnMap = {
  budgetCode: 'BUDGET_CODE',
  description: 'DESCRIPTION',
  typeBudget: 'TYPE_BUDGET',
  typeCalendar: 'TYPE_CALENDAR',
  dateUpdate: 'DATE_UPDATE',
  timeUpdate: 'TIME_UPDATE',
  flagBudget: 'FLAG_BUDGET',
  typeCodeBudget: 'TYPE_CODE_BUDGET',
  receiveGroup: 'RECEIVE_GROUP',
  flagAlert: 'FLAG_ALERT',
};

export const vBudgetCodeReverseColumnMap = vBudgetCodeColumnMap;

export type VBudgetCodePaginate = {
  data: VBudgetCode[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
