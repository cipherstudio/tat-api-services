export interface PsPwJob {
  emplid: string;
  emplRcd: number;
  effdt: Date;
  effseq: number;
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

export type PsPwJobPaginate = {
  data: PsPwJob[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
