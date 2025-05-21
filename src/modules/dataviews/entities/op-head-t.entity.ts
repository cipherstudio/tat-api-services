export interface OpHeadT {
  phtCode?: string;
  phtNameT?: string;
  phtNameE?: string;
  phtEmpDate?: string;
  phtPosWk?: string;
  phtPosEx?: string;
  phtPosNo?: string;
  phtLevelCode?: string;
}

export const opHeadTColumnMap = {
  phtCode: 'PHT_CODE',
  phtNameT: 'PHT_NAME_T',
  phtNameE: 'PHT_NAME_E',
  phtEmpDate: 'PHT_EMP_DATE',
  phtPosWk: 'PHT_POS_WK',
  phtPosEx: 'PHT_POS_EX',
  phtPosNo: 'PHT_POS_NO',
  phtLevelCode: 'PHT_LEVEL_CODE',
};

export const opHeadTReverseColumnMap = {
  phtCode: 'PHT_CODE',
  phtNameT: 'PHT_NAME_T',
  phtNameE: 'PHT_NAME_E',
  phtEmpDate: 'PHT_EMP_DATE',
  phtPosWk: 'PHT_POS_WK',
  phtPosEx: 'PHT_POS_EX',
  phtPosNo: 'PHT_POS_NO',
  phtLevelCode: 'PHT_LEVEL_CODE',
};

export type OpHeadTPaginate = {
  data: OpHeadT[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
