export interface Employee {
  pmtCode: string;
  pmtNameT: string;
  pmtNameE: string;
  pmtPosNo: string;
  pmtLevelCode: string;
  positionName: string;
}

export interface Section {
  code: string;
  name: string;
  abbreviation: string;
  positionAbbreviation: string;
  employees: Employee[];
}

export interface Division {
  code: string;
  name: string;
  abbreviation: string;
  positionAbbreviation: string;
  sections: Section[];         // งานทั้งหมดใน กอง นี้
  employees: Employee[];
}

export interface Department {
  code: string;
  name: string;
  abbreviation: string;
  positionAbbreviation: string;
  divisions: Division[];       // กองทั้งหมดใน ฝ่าย/สำนัก นี้
  employees: Employee[];
}

export interface MainOrganization {
  code: string;
  name: string;
  abbreviation: string;
  positionAbbreviation: string;
  departments: Department[];    // ฝ่าย/กลุ่ม (มี กอง และ งาน ซ้อนอยู่ข้างใน)
  employees: Employee[];        // พนักงานของหน่วยงานหลัก
}

export interface OrganizationStructure {
  mainOrganizations: MainOrganization[];
  totalEmployees: number;
  totalDepartments: number;
  totalDivisions: number;
  totalSections: number;
}

export const organizationStructureColumnMap = {
  code: 'POG_CODE',
  name: 'POG_DESC',
  abbreviation: 'POG_ABBREVIATION',
  positionAbbreviation: 'POG_POSNAME',
  pmtCode: 'PMT_CODE',
  pmtNameT: 'PMT_NAME_T',
  pmtNameE: 'PMT_NAME_E',
  pmtPosNo: 'PMT_POS_NO',
  pmtLevelCode: 'PMT_LEVEL_CODE',
  ppnNumber: 'PPN_NUMBER',
  ppnOrganize: 'PPN_ORGANIZE',
};

export type OrganizationStructurePaginate = {
  data: OrganizationStructure;
  meta: {
    total: number;
    timestamp: Date;
  };
}; 