export interface OpPosExecutiveR {
  ppeCode?: string;
  ppeDescT?: string;
  ppeDescE?: string;
  ppeWeight?: string;
  ppePosLev?: string;
}

export const opPosExecutiveRColumnMap = {
  ppeCode: 'PPE_CODE',
  ppeDescT: 'PPE_DESC_T',
  ppeDescE: 'PPE_DESC_E',
  ppeWeight: 'PPE_WEIGHT',
  ppePosLev: 'PPE_POS_LEV',
};

export const opPosExecutiveRReverseColumnMap = {
  ppeCode: 'PPE_CODE',
  ppeDescT: 'PPE_DESC_T',
  ppeDescE: 'PPE_DESC_E',
  ppeWeight: 'PPE_WEIGHT',
  ppePosLev: 'PPE_POS_LEV',
};

export type OpPosExecutiveRPaginate = {
  data: OpPosExecutiveR[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
