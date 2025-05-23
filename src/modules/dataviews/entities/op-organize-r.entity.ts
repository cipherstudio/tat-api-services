export interface OpOrganizeR {
  pogCode?: string;
  pogDesc?: string;
  pogCurrency?: string;
  pogAbbreviation?: string;
  pogDescE?: string;
  pogTitle?: string;
  pogType?: string;
  pogPosname?: string;
}

export const opOrganizeRColumnMap = {
  pogCode: 'POG_CODE',
  pogDesc: 'POG_DESC',
  pogCurrency: 'POG_CURRENCY',
  pogAbbreviation: 'POG_ABBREVIATION',
  pogDescE: 'POG_DESC_E',
  pogTitle: 'POG_TITLE',
  pogType: 'POG_TYPE',
  pogPosname: 'POG_POSNAME',
};

export const opOrganizeRReverseColumnMap = {
  pogCode: 'POG_CODE',
  pogDesc: 'POG_DESC',
  pogCurrency: 'POG_CURRENCY',
  pogAbbreviation: 'POG_ABBREVIATION',
  pogDescE: 'POG_DESC_E',
  pogTitle: 'POG_TITLE',
  pogType: 'POG_TYPE',
  pogPosname: 'POG_POSNAME',
};

export type OpOrganizeRPaginate = {
  data: OpOrganizeR[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
