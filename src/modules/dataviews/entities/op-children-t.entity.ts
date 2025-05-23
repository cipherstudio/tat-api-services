export interface OpChildrenT {
  pchCode?: string;
  pchSeqNo?: number;
  pchName?: string;
  pchBirthDate?: string;
  pchSex?: string;
  pchPetition?: string;
  pchTransDate?: string;
  pchOperCode?: string;
  pchPetDate?: string;
  pchPay?: number;
  pchIdcard?: string;
}

export const opChildrenTColumnMap = {
  pchCode: 'PCH_CODE',
  pchSeqNo: 'PCH_SEQ_NO',
  pchName: 'PCH_NAME',
  pchBirthDate: 'PCH_BIRTH_DATE',
  pchSex: 'PCH_SEX',
  pchPetition: 'PCH_PETITION',
  pchTransDate: 'PCH_TRANS_DATE',
  pchOperCode: 'PCH_OPER_CODE',
  pchPetDate: 'PCH_PET_DATE',
  pchPay: 'PCH_PAY',
  pchIdcard: 'PCH_IDCARD',
};

export const opChildrenTReverseColumnMap = {
  pchCode: 'PCH_CODE',
  pchSeqNo: 'PCH_SEQ_NO',
  pchName: 'PCH_NAME',
  pchBirthDate: 'PCH_BIRTH_DATE',
  pchSex: 'PCH_SEX',
  pchPetition: 'PCH_PETITION',
  pchTransDate: 'PCH_TRANS_DATE',
  pchOperCode: 'PCH_OPER_CODE',
  pchPetDate: 'PCH_PET_DATE',
  pchPay: 'PCH_PAY',
  pchIdcard: 'PCH_IDCARD',
};

export type OpChildrenTPaginate = {
  data: OpChildrenT[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
