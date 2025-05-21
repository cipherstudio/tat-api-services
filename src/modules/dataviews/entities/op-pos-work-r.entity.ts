export interface OpPosWorkR {
  pspCode?: string;
  pspDescT?: string;
  pspDescE?: string;
}

export const opPosWorkRColumnMap = {
  pspCode: 'PSP_CODE',
  pspDescT: 'PSP_DESC_T',
  pspDescE: 'PSP_DESC_E',
};

export const opPosWorkRReverseColumnMap = {
  pspCode: 'PSP_CODE',
  pspDescT: 'PSP_DESC_T',
  pspDescE: 'PSP_DESC_E',
};

export type OpPosWorkRPaginate = {
  data: OpPosWorkR[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
