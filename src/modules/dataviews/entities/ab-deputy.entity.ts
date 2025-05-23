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
}

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
};

export type AbDeputyPaginate = {
  data: AbDeputy[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
 