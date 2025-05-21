export interface OpMasterT {
  pmtCode?: string;
  pmtNameT?: string;
  pmtNameE?: string;
  pmtEmpDate?: string;
  pmtCmdDate?: string;
  pmtStQual?: string;
  pmtStFac?: string;
  pmtPosWk?: string;
  pmtPosEx?: string;
  pmtPosNo?: string;
  pmtLevelCode?: string;
  pmtLevDate?: string;
  pmtCurQual?: string;
  pmtCurFac?: string;
  pmtSalCode?: string;
  pmtStatus?: string;
  pmtPenaltyFlag?: string;
  pmtTransDate?: string;
  pmtOperCode?: string;
  pmtFlagMem?: string;
  pmtGworkCode?: string;
  pmtEmailAddr?: string;
}

export const opMasterTColumnMap = {
  pmtCode: 'PMT_CODE',
  pmtNameT: 'PMT_NAME_T',
  pmtNameE: 'PMT_NAME_E',
  pmtEmpDate: 'PMT_EMP_DATE',
  pmtCmdDate: 'PMT_CMD_DATE',
  pmtStQual: 'PMT_ST_QUAL',
  pmtStFac: 'PMT_ST_FAC',
  pmtPosWk: 'PMT_POS_WK',
  pmtPosEx: 'PMT_POS_EX',
  pmtPosNo: 'PMT_POS_NO',
  pmtLevelCode: 'PMT_LEVEL_CODE',
  pmtLevDate: 'PMT_LEV_DATE',
  pmtCurQual: 'PMT_CUR_QUAL',
  pmtCurFac: 'PMT_CUR_FAC',
  pmtSalCode: 'PMT_SAL_CODE',
  pmtStatus: 'PMT_STATUS',
  pmtPenaltyFlag: 'PMT_PENALTY_FLAG',
  pmtTransDate: 'PMT_TRANS_DATE',
  pmtOperCode: 'PMT_OPER_CODE',
  pmtFlagMem: 'PMT_FLAG_MEM',
  pmtGworkCode: 'PMT_GWORK_CODE',
  pmtEmailAddr: 'PMT_EMAIL_ADDR',
};

export const opMasterTReverseColumnMap = {
  pmtCode: 'PMT_CODE',
  pmtNameT: 'PMT_NAME_T',
  pmtNameE: 'PMT_NAME_E',
  pmtEmpDate: 'PMT_EMP_DATE',
  pmtCmdDate: 'PMT_CMD_DATE',
  pmtStQual: 'PMT_ST_QUAL',
  pmtStFac: 'PMT_ST_FAC',
  pmtPosWk: 'PMT_POS_WK',
  pmtPosEx: 'PMT_POS_EX',
  pmtPosNo: 'PMT_POS_NO',
  pmtLevelCode: 'PMT_LEVEL_CODE',
  pmtLevDate: 'PMT_LEV_DATE',
  pmtCurQual: 'PMT_CUR_QUAL',
  pmtCurFac: 'PMT_CUR_FAC',
  pmtSalCode: 'PMT_SAL_CODE',
  pmtStatus: 'PMT_STATUS',
  pmtPenaltyFlag: 'PMT_PENALTY_FLAG',
  pmtTransDate: 'PMT_TRANS_DATE',
  pmtOperCode: 'PMT_OPER_CODE',
  pmtFlagMem: 'PMT_FLAG_MEM',
  pmtGworkCode: 'PMT_GWORK_CODE',
  pmtEmailAddr: 'PMT_EMAIL_ADDR',
};

export type OpMasterTPaginate = {
  data: OpMasterT[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
