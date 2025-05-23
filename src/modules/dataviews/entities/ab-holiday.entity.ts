export interface AbHoliday {
  holidayDate: Date;
  description?: string;
  createDate: Date;
  psnCode?: string;
  pogCode?: string;
  holidayFlag?: string;
  pogType?: number;
  id?: number;
}

export const abHolidayColumnMap = {
  holidayDate: 'HOLIDAY_DATE',
  description: 'DESCRIPTION',
  createDate: 'CREATE_DATE',
  psnCode: 'PSN_CODE',
  pogCode: 'POG_CODE',
  holidayFlag: 'HOLIDAY_FLAG',
  pogType: 'POG_TYPE',
  id: 'ID',
};

export const abHolidayReverseColumnMap = {
  holidayDate: 'HOLIDAY_DATE',
  description: 'DESCRIPTION',
  createDate: 'CREATE_DATE',
  psnCode: 'PSN_CODE',
  pogCode: 'POG_CODE',
  holidayFlag: 'HOLIDAY_FLAG',
  pogType: 'POG_TYPE',
  id: 'ID',
};

export type AbHolidayPaginate = {
  data: AbHoliday[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
