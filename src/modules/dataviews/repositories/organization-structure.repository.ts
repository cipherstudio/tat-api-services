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
      employees = await this.getEmployeesData(allOrganizations.map(org => org.POG_CODE), query);
    }

    const structure = this.buildOrganizationStructure(camelCaseOrganizations, employees, query);

    if (query.onlyWithEmployees && query.includeEmployees) {
      structure.mainOrganizations = structure.mainOrganizations
        .map(main => this.filterOrganizationWithEmployees(main))
        .filter(main => main !== null);
    }

    return structure;
  }

  private async getEmployeesData(
    organizationCodes: string[],
    query?: QueryOrganizationStructureDto,
  ): Promise<any[]> {
    if (organizationCodes.length === 0) return [];

    let employeeQuery = this.knex('OP_ORGANIZE_R')
      .leftJoin('OP_POSITION_NO_T', this.knex.raw('OP_ORGANIZE_R.POG_CODE = TRIM(OP_POSITION_NO_T.PPN_ORGANIZE)'))
      .leftJoin('OP_MASTER_T', this.knex.raw('TRIM(OP_POSITION_NO_T.PPN_NUMBER) = TRIM(OP_MASTER_T.PMT_POS_NO)'))
      .leftJoin('VIEW_POSITION_4OT', (builder) => {
        builder.on(
          'VIEW_POSITION_4OT.POS_POSITIONCODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_POS_NO")'),
        );
      })
      .leftJoin('EMPLOYEE', 'OP_MASTER_T.PMT_CODE', 'EMPLOYEE.CODE')
      .select([
        'OP_ORGANIZE_R.POG_CODE',
        'OP_POSITION_NO_T.PPN_ORGANIZE',
        'OP_POSITION_NO_T.PPN_NUMBER', 
        'OP_MASTER_T.PMT_POS_NO',
        'OP_MASTER_T.PMT_CODE',
        'OP_MASTER_T.PMT_NAME_T',
        'OP_MASTER_T.PMT_NAME_E',
        'OP_MASTER_T.PMT_LEVEL_CODE',
        'VIEW_POSITION_4OT.POS_POSITIONNAME',
      ])
      .whereIn('OP_ORGANIZE_R.POG_CODE', organizationCodes)
      .whereNotNull('OP_MASTER_T.PMT_CODE');

    if (query?.employeeSearchTerm) {
      employeeQuery = employeeQuery.where((builder) => {
        builder
          .where('EMPLOYEE.NAME', 'like', `%${query.employeeSearchTerm}%`)
          .orWhere('VIEW_POSITION_4OT.POS_POSITIONNAME', 'like', `%${query.employeeSearchTerm}%`);
      });
    }

    // Apply ordering
    employeeQuery = employeeQuery.orderBy(['OP_ORGANIZE_R.POG_CODE', 'OP_MASTER_T.PMT_NAME_T']);

    const employees = await employeeQuery;

    const camelCaseEmployees = await Promise.all(
      employees.map(async (emp) => await toCamelCase(emp))
    );

    return camelCaseEmployees;
  }

  private buildOrganizationStructure(
    organizations: any[],
    employees: any[],
    query?: QueryOrganizationStructureDto,
  ): OrganizationStructure {
    const mainOrganizations: MainOrganization[] = [];
    const employeesByOrg = this.groupEmployeesByOrganization(employees, query);

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

      // รวม employee ทั้งหมดใน mainOrganization นี้
      const allEmployeesInMainOrg: Employee[] = [];
      const orgCodesInMainOrg = organizations
        .filter(org => org.pogCode.charAt(0) === mainCode.charAt(0))
        .map(org => org.pogCode);

      orgCodesInMainOrg.forEach(orgCode => {
        const orgEmployees = employeesByOrg.get(orgCode) || [];
        allEmployeesInMainOrg.push(...orgEmployees);
      });

      // Apply pagination สำหรับ employee ทั้งหมดใน mainOrganization
      let paginatedEmployees = allEmployeesInMainOrg;
      if (query?.employeeLimit || query?.employeePage) {
        const limit = query.employeeLimit || 10;
        const page = query.employeePage || 1;
        const offset = (page - 1) * limit;
        paginatedEmployees = allEmployeesInMainOrg.slice(offset, offset + limit);
      }

      // สร้าง Map ของ employee ที่ถูก paginated ตาม orgCode
      const paginatedEmployeesByOrg = new Map<string, Employee[]>();
      paginatedEmployees.forEach(emp => {
        // หา orgCode ของ employee นี้จากข้อมูลเดิม
        for (const [orgCode, empList] of employeesByOrg.entries()) {
          if (empList.some(e => e.pmtCode === emp.pmtCode)) {
            if (!paginatedEmployeesByOrg.has(orgCode)) {
              paginatedEmployeesByOrg.set(orgCode, []);
            }
            paginatedEmployeesByOrg.get(orgCode)!.push(emp);
            break;
          }
        }
      });

      const mainOrgStructure: MainOrganization = {
        code: mainOrg.pogCode,
        name: mainOrg.pogDesc || '',
        abbreviation: mainOrg.pogAbbreviation || '',
        positionAbbreviation: mainOrg.pogPosname || '',
        departments: [],
        employees: paginatedEmployeesByOrg.get(mainOrg.pogCode) || [],
      };

      const departments = organizations
        .filter(org => 
          this.isDepartment(org.pogCode) && org.pogCode.charAt(0) === mainCode.charAt(0)
        )
        .sort((a, b) => {
          const aIsGroup = a.pogCode.substring(2, 4) === '01'; // XX01XX
          const bIsGroup = b.pogCode.substring(2, 4) === '01'; // XX01XX
          
          if (aIsGroup && !bIsGroup) return 1;
          if (!aIsGroup && bIsGroup) return -1;
          
          return a.pogCode.localeCompare(b.pogCode); 
        });

      for (const dept of departments) {
        const deptStructure: Department = {
          code: dept.pogCode,
          name: dept.pogDesc || '',
          abbreviation: dept.pogAbbreviation || '',
          positionAbbreviation: dept.pogPosname || '',
          divisions: [],
          employees: paginatedEmployeesByOrg.get(dept.pogCode) || [],
        };

        // หา divisions ที่เป็นของ department นี้
        const departmentDivisions = organizations.filter(org => 
          this.isDivision(org.pogCode) && 
          org.pogCode.charAt(0) === mainCode.charAt(0) &&
          org.pogCode.substring(0, 2) === dept.pogCode.substring(0, 2) // หลัก 2 ตัวแรกเหมือนกัน
        );

        for (const div of departmentDivisions) {
          const divStructure: Division = {
            code: div.pogCode,
            name: div.pogDesc || '',
            abbreviation: div.pogAbbreviation || '',
            positionAbbreviation: div.pogPosname || '',
            sections: [],
            employees: paginatedEmployeesByOrg.get(div.pogCode) || [],
          };

          // หา sections ที่เป็นของ division นี้
          const divisionSections = organizations.filter(org => 
            this.isSection(org.pogCode) && 
            org.pogCode.charAt(0) === mainCode.charAt(0) &&
            org.pogCode.substring(0, 4) === div.pogCode.substring(0, 4) // หลัก 4 ตัวแรกเหมือนกัน
          );

          for (const sect of divisionSections) {
            const sectStructure: Section = {
              code: sect.pogCode,
              name: sect.pogDesc || '',
              abbreviation: sect.pogAbbreviation || '',
              positionAbbreviation: sect.pogPosname || '',
              employees: paginatedEmployeesByOrg.get(sect.pogCode) || [],
            };
            divStructure.sections.push(sectStructure);
          }

          deptStructure.divisions.push(divStructure);
        }

        mainOrgStructure.departments.push(deptStructure);
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

  private groupEmployeesByOrganization(
    employees: any[],
    query?: QueryOrganizationStructureDto,
  ): Map<string, Employee[]> {
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
        positionName: emp.posPositionname || '',
      });
    });

    return grouped;
  }

  private filterOrganizationWithEmployees(mainOrg: MainOrganization): MainOrganization | null {
    const filteredDepartments = mainOrg.departments
      .map(dept => {
        const filteredDivisions = dept.divisions
          .map(div => {
            const filteredSections = div.sections.filter(sect => sect.employees.length > 0);
            const hasEmployeesInDiv = div.employees.length > 0 || filteredSections.length > 0;
            
            return hasEmployeesInDiv ? { ...div, sections: filteredSections } : null;
          })
          .filter(div => div !== null);

        const hasEmployeesInDept = dept.employees.length > 0 || filteredDivisions.length > 0;
        
        return hasEmployeesInDept ? { ...dept, divisions: filteredDivisions } : null;
      })
      .filter(dept => dept !== null);

    const hasEmployees = mainOrg.employees.length > 0 || filteredDepartments.length > 0;

    return hasEmployees
      ? {
          ...mainOrg,
          departments: filteredDepartments,
        }
      : null;
  }

  private isMainOrganization(code: string): boolean {
    return code.endsWith('00000') && code.length === 6;
  }

  private isDepartment(code: string): boolean {
    return (code.endsWith('0000') && !code.endsWith('00000') && code.length === 6) ||
           (code.endsWith('0100') && code.charAt(1) === '0' && code.length === 6);
  }

  private isDivision(code: string): boolean {   
    if (code.length !== 6 || !code.endsWith('0')) return false;
    
    const isNotMainOrg = !this.isMainOrganization(code);
    const isNotDepartment = !this.isDepartment(code);
    
    return isNotMainOrg && isNotDepartment;
  }

  private isSection(code: string): boolean {
    return code.length === 6 && !code.endsWith('0') && 
           !this.isMainOrganization(code) && !this.isDepartment(code);
  }
} 