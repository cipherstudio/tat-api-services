/** หน่วยงานจาก OP_ORGANIZE_R (join กับ GPD_DEPUTY_POG_CODE) */
export interface AbDeputyOrganizeRef {
  pogCode?: string;
  pogDesc?: string;
  pogAbbreviation?: string;
  pogDescE?: string;
  pogTitle?: string;
  pogType?: string;
  pogPosname?: string;
  pogCurrency?: string;
}

/** ตำแหน่งผู้บริหารจาก OP_POS_EXECUTIVE_R (join กับ GDP_DEPUTY_POSITION_EX = PPE_CODE) */
export interface AbDeputyExecutiveRef {
  ppeCode?: string;
  ppeDescT?: string;
  ppeDescE?: string;
  ppeWeight?: string;
  ppePosLev?: string;
}

/** ข้อมูลเต็มจาก AB_DEPUTY + join (ใช้กับ GET ab-deputies / repository) */
export interface AbDeputy {
  gdpId: number;
  pmtCode: number;
  gpdDeputyPogCode: string;
  gdpDeputyPositionEx: string;
  gdpDeputyPriority: number;
  gdpDeputyStartDate: Date;
  gdpDeputyEndDate: Date;
  gdpDeputyRemark: string;
  gdpCreatedBy: number;
  gdpCreatedDate: Date;
  gdpLastUpdateBy: number;
  gdpLastUpdateDate: Date;
  gdpDeputyStatus: number;
  pogCode: string;
  pogDesc: string;
  isExecutive?: string;
  deputyOrganize?: AbDeputyOrganizeRef;
  deputyExecutive?: AbDeputyExecutiveRef;
}

/**
 * รูปแบบที่ส่งคู่ employee API เท่านั้น (เฉพาะข้อมูลจาก join ตามฟิลด์ที่กำหนด)
 */
export type EmployeeDeputyPublic = {
  deputyOrganize?: {
    pogCode?: string;
    pogDesc?: string;
    pogAbbreviation?: string;
    pogDescE?: string;
    pogType?: string;
    pogPosname?: string;
  };
  deputyExecutive?: {
    ppeCode?: string;
    ppeDescT?: string;
    ppeDescE?: string;
    ppeWeight?: string;
    ppePosLev?: string;
  };
};

export const abDeputyColumnMap = {
  gdpId: 'GDP_ID',
  pmtCode: 'PMT_CODE',
  gpdDeputyPogCode: 'GPD_DEPUTY_POG_CODE',
  gdpDeputyPositionEx: 'GDP_DEPUTY_POSITION_EX',
  gdpDeputyPriority: 'GDP_DEPUTY_PRIORITY',
  gdpDeputyStartDate: 'GDP_DEPUTY_START_DATE',
  gdpDeputyEndDate: 'GDP_DEPUTY_END_DATE',
  gdpDeputyRemark: 'GDP_DEPUTY_REMARK',
  gdpCreatedBy: 'GDP_CREATED_BY',
  gdpCreatedDate: 'GDP_CREATED_DATE',
  gdpLastUpdateBy: 'GDP_LAST_UPDATE_BY',
  gdpLastUpdateDate: 'GDP_LAST_UPDATE_DATE',
  gdpDeputyStatus: 'GDP_DEPUTY_STATUS',
  pogCode: 'POG_CODE',
  pogDesc: 'POG_DESC',
  isExecutive: 'IS_EXECUTIVE',
};

export const abDeputyReverseColumnMap = {
  gdpId: 'GDP_ID',
  pmtCode: 'PMT_CODE',
  gpdDeputyPogCode: 'GPD_DEPUTY_POG_CODE',
  gdpDeputyPositionEx: 'GDP_DEPUTY_POSITION_EX',
  gdpDeputyPriority: 'GDP_DEPUTY_PRIORITY',
  gdpDeputyStartDate: 'GDP_DEPUTY_START_DATE',
  gdpDeputyEndDate: 'GDP_DEPUTY_END_DATE',
  gdpDeputyRemark: 'GDP_DEPUTY_REMARK',
  gdpCreatedBy: 'GDP_CREATED_BY',
  gdpCreatedDate: 'GDP_CREATED_DATE',
  gdpLastUpdateBy: 'GDP_LAST_UPDATE_BY',
  gdpLastUpdateDate: 'GDP_LAST_UPDATE_DATE',
  gdpDeputyStatus: 'GDP_DEPUTY_STATUS',
  pogCode: 'POG_CODE',
  pogDesc: 'POG_DESC',
  isExecutive: 'IS_EXECUTIVE',
};

export type AbDeputyPaginate = {
  data: AbDeputy[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
