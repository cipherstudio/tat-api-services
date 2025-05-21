export interface ViewPosition4ot {
  posPositioncode?: string;
  posPositionname?: string;
  posReportsTo?: string;
  posReportsToname?: string;
  posDeptId?: string;
  posJobCode?: string;
  posEffDate?: Date;
  posIsheader?: string;
  posSupvLvlId?: string;
  posLangCd?: string;
  descr?: string;
  descrshot?: string;
}

export const viewPosition4otColumnMap = {
  posPositioncode: 'POS_POSITIONCODE',
  posPositionname: 'POS_POSITIONNAME',
  posReportsTo: 'POS_REPORTS_TO',
  posReportsToname: 'POS_REPORTS_TONAME',
  posDeptId: 'POS_DEPT_ID',
  posJobCode: 'POS_JOB_CODE',
  posEffDate: 'POS_EFF_DATE',
  posIsheader: 'POS_ISHEADER',
  posSupvLvlId: 'POS_SUPV_LVL_ID',
  posLangCd: 'POS_LANG_CD',
  descr: 'DESCR',
  descrshot: 'DESCRSHOT',
};

export const viewPosition4otReverseColumnMap = viewPosition4otColumnMap;

export type ViewPosition4otPaginate = {
  data: ViewPosition4ot[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
