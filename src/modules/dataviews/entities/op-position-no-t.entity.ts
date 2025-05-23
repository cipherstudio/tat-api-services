export interface OpPositionNoT {
  ppnNumber?: string;
  ppnOrganize?: string;
  ppnTransDate?: string;
  ppnOperCode?: string;
}

export const opPositionNoTColumnMap = {
  ppnNumber: 'PPN_NUMBER',
  ppnOrganize: 'PPN_ORGANIZE',
  ppnTransDate: 'PPN_TRANS_DATE',
  ppnOperCode: 'PPN_OPER_CODE',
};

export const opPositionNoTReverseColumnMap = {
  ppnNumber: 'PPN_NUMBER',
  ppnOrganize: 'PPN_ORGANIZE',
  ppnTransDate: 'PPN_TRANS_DATE',
  ppnOperCode: 'PPN_OPER_CODE',
};

export type OpPositionNoTPaginate = {
  data: OpPositionNoT[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
