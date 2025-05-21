export interface OpPositionT {
  emplid?: string;
  emplRcd?: number;
  effdt?: Date;
  effseq?: number;
  hireDt?: Date;
  positionNbr?: string;
  salAdminPlan?: string;
  grade?: string;
  step?: number;
  deptid?: string;
  officerCd?: string;
  action?: string;
  actionReason?: string;
  xOrderNo?: string;
  xOrderDt?: Date;
  location?: string;
  jobcode?: string;
  setidDept?: string;
  supvLvlId?: string;
  hrStatus?: string;
  lastupdDttm?: Date;
}

export const opPositionTColumnMap = {
  emplid: 'EMPLID',
  emplRcd: 'EMPL_RCD',
  effdt: 'EFFDT',
  effseq: 'EFFSEQ',
  hireDt: 'HIRE_DT',
  positionNbr: 'POSITION_NBR',
  salAdminPlan: 'SAL_ADMIN_PLAN',
  grade: 'GRADE',
  step: 'STEP',
  deptid: 'DEPTID',
  officerCd: 'OFFICER_CD',
  action: 'ACTION',
  actionReason: 'ACTION_REASON',
  xOrderNo: 'X_ORDER_NO',
  xOrderDt: 'X_ORDER_DT',
  location: 'LOCATION',
  jobcode: 'JOBCODE',
  setidDept: 'SETID_DEPT',
  supvLvlId: 'SUPV_LVL_ID',
  hrStatus: 'HR_STATUS',
  lastupdDttm: 'LASTUPDDTTM',
};

export const opPositionTReverseColumnMap = opPositionTColumnMap;

export type OpPositionTPaginate = {
  data: OpPositionT[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
