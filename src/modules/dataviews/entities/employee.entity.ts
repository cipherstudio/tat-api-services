export interface Employee {
  code: string;
  name: string;
  sex: string;
  address: string;
  khateCode: string;
  khate: string;
  provinceCode: string;
  province: string;
  postcode: string;
  birthDate: Date;
  salary: number;
  bankAccount: string;
  startWork: Date;
  pmtPosWork: string;
  position: string;
  apaPpnNumber: string;
  exPositionCode: string;
  exPosition: string;
  levelPosition: string;
  pogCode: string;
  workinggroup: string;
  unit: string;
  section: string;
  division: string;
  department: string;
  father: string;
  fatherAlive: string;
  mother: string;
  motherAlive: string;
  mariried: string;
  spouse: string;
  email: string;
  typeData: string;
  cardId: string;
  taxId: string;
}

export const employeeColumnMap = {
  code: 'CODE',
  name: 'NAME',
  sex: 'SEX',
  address: 'ADDRESS',
  khateCode: 'KHATE_CODE',
  khate: 'KHATE',
  provinceCode: 'PROVINCE_CODE',
  province: 'PROVINCE',
  postcode: 'POSTCODE',
  birthDate: 'BIRTH_DATE',
  salary: 'SALARY',
  bankAccount: 'BANK_ACCOUNT',
  startWork: 'START_WORK',
  pmtPosWork: 'PMT_POS_WORK',
  position: 'POSITION',
  apaPpnNumber: 'APA_PPN_NUMBER',
  exPositionCode: 'EX_POSITION_CODE',
  exPosition: 'EX_POSITION',
  levelPosition: 'LEVEL_POSITION',
  pogCode: 'POG_CODE',
  workinggroup: 'WORKINGGROUP',
  unit: 'UNIT',
  section: 'SECTION',
  division: 'DIVISION',
  department: 'DEPARTMENT',
  father: 'FATHER',
  fatherAlive: 'FATHER_ALIVE',
  mother: 'MOTHER',
  motherAlive: 'MOTHER_ALIVE',
  mariried: 'MARIRIED',
  spouse: 'SPOUSE',
  email: 'EMAIL',
  typeData: 'TYPE_DATA',
  cardId: 'CARD_ID',
  taxId: 'TAX_ID',
};

export const employeeReverseColumnMap = {
  code: 'CODE',
  name: 'NAME',
  sex: 'SEX',
  address: 'ADDRESS',
  khateCode: 'KHATE_CODE',
  khate: 'KHATE',
  provinceCode: 'PROVINCE_CODE',
  province: 'PROVINCE',
  postcode: 'POSTCODE',
  birthDate: 'BIRTH_DATE',
  salary: 'SALARY',
  bankAccount: 'BANK_ACCOUNT',
  startWork: 'START_WORK',
  pmtPosWork: 'PMT_POS_WORK',
  position: 'POSITION',
  apaPpnNumber: 'APA_PPN_NUMBER',
  exPositionCode: 'EX_POSITION_CODE',
  exPosition: 'EX_POSITION',
  levelPosition: 'LEVEL_POSITION',
  pogCode: 'POG_CODE',
  workinggroup: 'WORKINGGROUP',
  unit: 'UNIT',
  section: 'SECTION',
  division: 'DIVISION',
  department: 'DEPARTMENT',
  father: 'FATHER',
  fatherAlive: 'FATHER_ALIVE',
  mother: 'MOTHER',
  motherAlive: 'MOTHER_ALIVE',
  mariried: 'MARIRIED',
  spouse: 'SPOUSE',
  email: 'EMAIL',
  typeData: 'TYPE_DATA',
  cardId: 'CARD_ID',
  taxId: 'TAX_ID',
};

export type EmployeePaginate = {
  data: Employee[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
 