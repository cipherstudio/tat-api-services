import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOrganizationStructureDto } from '../dto/query-organization-structure.dto';
import {
  OrganizationStructure,
  MainOrganization,
  Department,
  Division,
  Section,
  Employee,
} from '../entities/organization-structure.entity';

@Injectable()
export class OrganizationStructureRepository extends KnexBaseRepository<any> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_ORGANIZE_R');
  }

  async getOrganizationStructure(
    query: QueryOrganizationStructureDto,
  ): Promise<OrganizationStructure> {

    let orgQuery = this.knex('OP_ORGANIZE_R').select('*');
    let parentOrgCodes: string[] = [];

    if (query.mainOrganizationCode) {
      orgQuery = orgQuery.where('POG_CODE', 'like', `${query.mainOrganizationCode}%`);
    } else if (query.departmentCode) {
      orgQuery = orgQuery.where('POG_CODE', 'like', `${query.departmentCode}%`);
      const mainOrgCode = query.departmentCode.charAt(0) + '00000';
      parentOrgCodes.push(mainOrgCode);
    } else if (query.divisionCode) {
      orgQuery = orgQuery.where('POG_CODE', 'like', `${query.divisionCode}%`);
      const mainOrgCode = query.divisionCode.charAt(0) + '00000';
      const deptCode = query.divisionCode.substring(0, 2) + '0000';
      parentOrgCodes.push(mainOrgCode, deptCode);
    } else if (query.sectionCode) {
      orgQuery = orgQuery.where('POG_CODE', query.sectionCode);
      const mainOrgCode = query.sectionCode.charAt(0) + '00000';
      const deptCode = query.sectionCode.substring(0, 2) + '0000';
      const divCode = query.sectionCode.substring(0, 3) + '000';
      parentOrgCodes.push(mainOrgCode, deptCode, divCode);
    }
    
    if (query.searchTerm) {
      orgQuery = orgQuery.where('POG_DESC', 'like', `%${query.searchTerm}%`);
    }

        const organizations = await orgQuery.orderBy('POG_CODE', 'asc');

    let allOrganizations = [...organizations];
    if (parentOrgCodes.length > 0) {
      const parentOrgs = await this.knex('OP_ORGANIZE_R')
        .select('*')
        .whereIn('POG_CODE', parentOrgCodes)
        .orderBy('POG_CODE', 'asc');
      
      const existingCodes = new Set(organizations.map(org => org.POG_CODE));
      const newParentOrgs = parentOrgs.filter(org => !existingCodes.has(org.POG_CODE));
      allOrganizations = [...parentOrgs, ...organizations];
    }

    const camelCaseOrganizations = await Promise.all(
      allOrganizations.map(async (org) => await toCamelCase(org))
    );

    let employees: any[] = [];
    if (query.includeEmployees) {
      employees = await this.getEmployeesData(allOrganizations.map(org => org.POG_CODE));
    }

    const structure = this.buildOrganizationStructure(camelCaseOrganizations, employees);

    if (query.onlyWithEmployees && query.includeEmployees) {
      structure.mainOrganizations = structure.mainOrganizations
        .map(main => this.filterOrganizationWithEmployees(main))
        .filter(main => main !== null);
    }

    return structure;
  }

  private async getEmployeesData(organizationCodes: string[]): Promise<any[]> {
    if (organizationCodes.length === 0) return [];

    const employees = await this.knex('OP_ORGANIZE_R')
      .leftJoin('OP_POSITION_NO_T', this.knex.raw('OP_ORGANIZE_R.POG_CODE = TRIM(OP_POSITION_NO_T.PPN_ORGANIZE)'))
      .leftJoin('OP_MASTER_T', this.knex.raw('TRIM(OP_POSITION_NO_T.PPN_NUMBER) = TRIM(OP_MASTER_T.PMT_POS_NO)'))
      .select([
        'OP_ORGANIZE_R.POG_CODE',
        'OP_POSITION_NO_T.PPN_ORGANIZE',
        'OP_POSITION_NO_T.PPN_NUMBER', 
        'OP_MASTER_T.PMT_POS_NO',
        'OP_MASTER_T.PMT_CODE',
        'OP_MASTER_T.PMT_NAME_T',
        'OP_MASTER_T.PMT_NAME_E',
        'OP_MASTER_T.PMT_LEVEL_CODE',
      ])
      .whereIn('OP_ORGANIZE_R.POG_CODE', organizationCodes)
      .whereNotNull('OP_MASTER_T.PMT_CODE')
      .orderBy(['OP_ORGANIZE_R.POG_CODE', 'OP_MASTER_T.PMT_NAME_T']);



    const camelCaseEmployees = await Promise.all(
      employees.map(async (emp) => await toCamelCase(emp))
    );

    return camelCaseEmployees;
  }

  private buildOrganizationStructure(
    organizations: any[],
    employees: any[],
  ): OrganizationStructure {
    const mainOrganizations: MainOrganization[] = [];
    const employeesByOrg = this.groupEmployeesByOrganization(employees);

    const orgsByCode = new Map();
    organizations.forEach(org => {
      orgsByCode.set(org.pogCode, org);
    });

    const mainOrgCodes = organizations
      .filter(org => this.isMainOrganization(org.pogCode))
      .map(org => org.pogCode);

    for (const mainCode of mainOrgCodes) {
      const mainOrg = orgsByCode.get(mainCode);
      if (!mainOrg) continue;

      const mainOrgStructure: MainOrganization = {
        code: mainOrg.pogCode,
        name: mainOrg.pogDesc || '',
        abbreviation: mainOrg.pogAbbreviation || '',
        positionAbbreviation: mainOrg.pogPosname || '',
        departments: [],
        divisions: [],
        sections: [],
        employees: employeesByOrg.get(mainOrg.pogCode) || [],
      };

      const departments = organizations.filter(org => 
        this.isDepartment(org.pogCode) && org.pogCode.charAt(0) === mainCode.charAt(0)
      );

      for (const dept of departments) {
        const deptStructure: Department = {
          code: dept.pogCode,
          name: dept.pogDesc || '',
          abbreviation: dept.pogAbbreviation || '',
          positionAbbreviation: dept.pogPosname || '',
          employees: employeesByOrg.get(dept.pogCode) || [],
        };
        mainOrgStructure.departments.push(deptStructure);
      }

      const divisions = organizations.filter(org => 
        this.isDivision(org.pogCode) && org.pogCode.charAt(0) === mainCode.charAt(0)
      );

      for (const div of divisions) {
        const divStructure: Division = {
          code: div.pogCode,
          name: div.pogDesc || '',
          abbreviation: div.pogAbbreviation || '',
          positionAbbreviation: div.pogPosname || '',
          employees: employeesByOrg.get(div.pogCode) || [],
        };
        mainOrgStructure.divisions.push(divStructure);
      }

      const sections = organizations.filter(org => 
        this.isSection(org.pogCode) && org.pogCode.charAt(0) === mainCode.charAt(0)
      );

      for (const sect of sections) {
        const sectStructure: Section = {
          code: sect.pogCode,
          name: sect.pogDesc || '',
          abbreviation: sect.pogAbbreviation || '',
          positionAbbreviation: sect.pogPosname || '',
          employees: employeesByOrg.get(sect.pogCode) || [],
        };
        mainOrgStructure.sections.push(sectStructure);
      }

      mainOrganizations.push(mainOrgStructure);
    }

    const totalEmployees = employees.length;
    const totalDepartments = organizations.filter(org => this.isDepartment(org.pogCode)).length;
    const totalDivisions = organizations.filter(org => this.isDivision(org.pogCode)).length;
    const totalSections = organizations.filter(org => this.isSection(org.pogCode)).length;

    return {
      mainOrganizations,
      totalEmployees,
      totalDepartments,
      totalDivisions,
      totalSections,
    };
  }

  private groupEmployeesByOrganization(employees: any[]): Map<string, Employee[]> {
    const grouped = new Map<string, Employee[]>();

    employees.forEach(emp => {
      const orgCode = emp.pogCode;
      if (!grouped.has(orgCode)) {
        grouped.set(orgCode, []);
      }

      grouped.get(orgCode)!.push({
        pmtCode: emp.pmtCode,
        pmtNameT: emp.pmtNameT,
        pmtNameE: emp.pmtNameE,
        pmtPosNo: emp.pmtPosNo,
        pmtLevelCode: emp.pmtLevelCode,
      });
    });

    return grouped;
  }

  private filterOrganizationWithEmployees(mainOrg: MainOrganization): MainOrganization | null {
    const filteredDepartments = mainOrg.departments.filter(dept => dept.employees.length > 0);
    
    const filteredDivisions = mainOrg.divisions.filter(div => div.employees.length > 0);
    
    const filteredSections = mainOrg.sections.filter(sect => sect.employees.length > 0);

    const hasEmployees = mainOrg.employees.length > 0 || 
                        filteredDepartments.length > 0 || 
                        filteredDivisions.length > 0 || 
                        filteredSections.length > 0;

    return hasEmployees
      ? {
          ...mainOrg,
          departments: filteredDepartments,
          divisions: filteredDivisions,
          sections: filteredSections,
        }
      : null;
  }

  private isMainOrganization(code: string): boolean {
    return code.endsWith('00000') && code.length === 6;
  }

  private isDepartment(code: string): boolean {
    return code.endsWith('0000') && !code.endsWith('00000') && code.length === 6;
  }

  private isDivision(code: string): boolean {   
    return code.endsWith('00') && !code.endsWith('000') && code.length === 6;
  }

  private isSection(code: string): boolean {
    return !code.endsWith('00') && code.length === 6;
  }
} 