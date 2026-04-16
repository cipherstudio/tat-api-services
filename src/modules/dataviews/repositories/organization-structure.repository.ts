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
import { buildEmployeeDeputyPublic } from '../utils/employee-deputy-public.mapper';

const AB_DEPUTY_STATUS_ACTIVE = 0;

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
      const orgCodes = allOrganizations.map((org) => org.POG_CODE);
      const regular = await this.getEmployeesData(orgCodes, query);
      const deputies = await this.getDeputyEmployeesData(orgCodes, query);
      employees = [...regular, ...deputies];
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
      .leftJoin('VIEW_POSITION_4OT', this.knex.raw('TRIM(OP_MASTER_T.PMT_POS_NO) = TRIM(VIEW_POSITION_4OT.POS_POSITIONCODE)'))
      .leftJoin('EMPLOYEE', 'OP_MASTER_T.PMT_CODE', 'EMPLOYEE.CODE')
      .leftJoin('OP_HEAD_T', this.knex.raw('TRIM(OP_POSITION_NO_T.PPN_NUMBER) = TRIM(OP_HEAD_T.PHT_POS_NO)'))
      .leftJoin('VIEW_POSITION_4OT as VIEW_POSITION_4OT_HEAD', this.knex.raw('TRIM(OP_HEAD_T.PHT_POS_NO) = TRIM(VIEW_POSITION_4OT_HEAD.POS_POSITIONCODE)'))
      .select([
        'OP_ORGANIZE_R.POG_CODE',
        'OP_POSITION_NO_T.PPN_ORGANIZE',
        'OP_POSITION_NO_T.PPN_NUMBER',
        'OP_MASTER_T.PMT_POS_NO',
        'OP_MASTER_T.PMT_POS_EX',
        'OP_MASTER_T.PMT_CODE',
        'OP_MASTER_T.PMT_NAME_T',
        'OP_MASTER_T.PMT_NAME_E',
        'OP_MASTER_T.PMT_LEVEL_CODE',
        'VIEW_POSITION_4OT.POS_POSITIONNAME',
        'OP_HEAD_T.PHT_CODE',
        'OP_HEAD_T.PHT_NAME_T',
        'OP_HEAD_T.PHT_NAME_E',
        'OP_HEAD_T.PHT_POS_NO',
        'OP_HEAD_T.PHT_LEVEL_CODE',
        'VIEW_POSITION_4OT_HEAD.POS_POSITIONNAME as HEAD_POSITIONNAME',
      ])
      .whereIn('OP_ORGANIZE_R.POG_CODE', organizationCodes)
      .where(function() {
        this.whereNotNull('OP_MASTER_T.PMT_CODE')
            .whereNotNull('OP_MASTER_T.PMT_POS_EX')
            .orWhereNotNull('OP_HEAD_T.PHT_CODE');
      });

    if (query?.employeeSearchTerm) {
      employeeQuery = employeeQuery.where((builder) => {
        builder
          .where('EMPLOYEE.NAME', 'like', `%${query.employeeSearchTerm}%`)
          .orWhere('VIEW_POSITION_4OT.POS_POSITIONNAME', 'like', `%${query.employeeSearchTerm}%`)
          .orWhere('OP_HEAD_T.PHT_NAME_T', 'like', `%${query.employeeSearchTerm}%`);
      });
    }

    employeeQuery = employeeQuery
      .orderBy('OP_ORGANIZE_R.POG_CODE')
      .orderByRaw('CASE WHEN OP_MASTER_T.PMT_LEVEL_CODE IS NULL OR TRIM(OP_MASTER_T.PMT_LEVEL_CODE) = \'\' THEN \'00\' ELSE OP_MASTER_T.PMT_LEVEL_CODE END DESC')
      .orderBy('OP_MASTER_T.PMT_NAME_T');

    const employees = await employeeQuery;

    const camelCaseEmployees = await Promise.all(
      employees.map(async (emp) => await toCamelCase(emp))
    );

    return camelCaseEmployees;
  }

  private async getDeputyEmployeesData(
    organizationCodes: string[],
    query?: QueryOrganizationStructureDto,
  ): Promise<any[]> {
    if (organizationCodes.length === 0) return [];

    const codes = [
      ...new Set(
        organizationCodes
          .map((c) => String(c ?? '').trim())
          .filter((c) => c.length > 0),
      ),
    ];
    if (codes.length === 0) return [];

    const omtSubSql = `(
      SELECT ranked."PMT_CODE", ranked."PMT_NAME_T", ranked."PMT_NAME_E", ranked."PMT_POS_NO", ranked."PMT_LEVEL_CODE"
      FROM (
        SELECT
          pm.PMT_CODE AS "PMT_CODE",
          pm.PMT_NAME_T AS "PMT_NAME_T",
          pm.PMT_NAME_E AS "PMT_NAME_E",
          pm.PMT_POS_NO AS "PMT_POS_NO",
          pm.PMT_LEVEL_CODE AS "PMT_LEVEL_CODE",
          ROW_NUMBER() OVER (PARTITION BY RTRIM(pm.PMT_CODE) ORDER BY pm.PMT_CODE ASC) AS rn
        FROM OP_MASTER_T pm
      ) ranked
      WHERE ranked.rn = 1
    ) OMT`;

    const knex = this.knex;
    const inPlaceholders = codes.map(() => '?').join(', ');
    let deputyQuery = knex({ ad: 'AB_DEPUTY' })
      .leftJoin(knex.raw(`${omtSubSql}`), function () {
        this.on(
          knex.raw('RTRIM("ad"."PMT_CODE") = RTRIM(OMT.PMT_CODE)'),
        );
      })
      .leftJoin('VIEW_POSITION_4OT as vp_orig', function () {
        this.on(
          knex.raw(
            'RTRIM("vp_orig"."POS_POSITIONCODE") = RTRIM(OMT.PMT_POS_NO)',
          ),
        );
      })
      .leftJoin('OP_POS_EXECUTIVE_R as pex', function () {
        this.on(
          knex.raw(
            'RTRIM("pex"."PPE_CODE") = RTRIM("ad"."GDP_DEPUTY_POSITION_EX")',
          ),
        );
      })
      .leftJoin('OP_ORGANIZE_R as org_deputy', function () {
        this.on(
          knex.raw(
            'RTRIM("org_deputy"."POG_CODE") = RTRIM("ad"."GPD_DEPUTY_POG_CODE")',
          ),
        );
      })
      .where('ad.GDP_DEPUTY_STATUS', AB_DEPUTY_STATUS_ACTIVE)
      .whereRaw(
        `RTRIM("ad"."GPD_DEPUTY_POG_CODE") IN (${inPlaceholders})`,
        codes,
      )
      .select([
        knex.raw('RTRIM("ad"."GPD_DEPUTY_POG_CODE") as "POG_CODE"'),
        'ad.PMT_CODE',
        'ad.GDP_DEPUTY_POSITION_EX',
        'ad.GDP_DEPUTY_PRIORITY',
        'ad.POG_CODE as AB_DEPUTY_ORIG_POG_CODE',
        'ad.POG_DESC as AB_DEPUTY_ORIG_POG_DESC',
        'OMT.PMT_NAME_T',
        'OMT.PMT_NAME_E',
        'OMT.PMT_POS_NO',
        'OMT.PMT_LEVEL_CODE',
        'vp_orig.POS_POSITIONNAME as ORIGINAL_POS_POSITIONNAME',
        knex.raw('"org_deputy"."POG_CODE" as "ORG_REF_POG_CODE"'),
        knex.raw('"org_deputy"."POG_DESC" as "ORG_REF_POG_DESC"'),
        knex.raw(
          '"org_deputy"."POG_ABBREVIATION" as "ORG_REF_POG_ABBREVIATION"',
        ),
        knex.raw('"org_deputy"."POG_DESC_E" as "ORG_REF_POG_DESC_E"'),
        knex.raw('"org_deputy"."POG_TITLE" as "ORG_REF_POG_TITLE"'),
        knex.raw('"org_deputy"."POG_TYPE" as "ORG_REF_POG_TYPE"'),
        knex.raw('"org_deputy"."POG_POSNAME" as "ORG_REF_POG_POSNAME"'),
        knex.raw('"org_deputy"."POG_CURRENCY" as "ORG_REF_POG_CURRENCY"'),
        knex.raw('"pex"."PPE_CODE" as "PEX_REF_PPE_CODE"'),
        knex.raw('"pex"."PPE_DESC_T" as "PEX_REF_PPE_DESC_T"'),
        knex.raw('"pex"."PPE_DESC_E" as "PEX_REF_PPE_DESC_E"'),
        knex.raw('"pex"."PPE_WEIGHT" as "PEX_REF_PPE_WEIGHT"'),
        knex.raw('"pex"."PPE_POS_LEV" as "PEX_REF_PPE_POS_LEV"'),
        knex.raw('1 as "IS_DEPUTY_ROW"'),
      ]);

    if (query?.employeeSearchTerm) {
      const term = query.employeeSearchTerm;
      deputyQuery = deputyQuery.where((builder) => {
        builder
          .where('OMT.PMT_NAME_T', 'like', `%${term}%`)
          .orWhere('pex.PPE_DESC_T', 'like', `%${term}%`)
          .orWhere('ad.POG_DESC', 'like', `%${term}%`);
      });
    }

    deputyQuery = deputyQuery
      .orderByRaw('RTRIM("ad"."GPD_DEPUTY_POG_CODE")')
      .orderBy('ad.GDP_DEPUTY_PRIORITY', 'asc');

    const rows = await deputyQuery;
    return Promise.all(rows.map((r) => toCamelCase(r)));
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

      const allEmployeesInMainOrg: Employee[] = [];
      const orgCodesInMainOrg = organizations
        .filter(org => org.pogCode.charAt(0) === mainCode.charAt(0))
        .map(org => org.pogCode);

      orgCodesInMainOrg.forEach(orgCode => {
        const orgEmployees = employeesByOrg.get(orgCode) || [];
        allEmployeesInMainOrg.push(...orgEmployees);
      });

      let paginatedEmployees = allEmployeesInMainOrg;
      if (query?.employeeLimit || query?.employeePage) {
        const limit = query.employeeLimit || 10;
        const page = query.employeePage || 1;
        const offset = (page - 1) * limit;
        paginatedEmployees = allEmployeesInMainOrg.slice(offset, offset + limit);
      }

      const paginatedEmployeesByOrg = new Map<string, Employee[]>();
      paginatedEmployees.forEach((emp) => {
        const bucket = emp.organizationPogCode;
        if (bucket) {
          if (!paginatedEmployeesByOrg.has(bucket)) {
            paginatedEmployeesByOrg.set(bucket, []);
          }
          paginatedEmployeesByOrg.get(bucket)!.push(emp);
            return;
        }
        for (const [orgCode, empList] of employeesByOrg.entries()) {
          if (empList.some((e) => e.pmtCode === emp.pmtCode)) {
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
          const aIsGroup = a.pogCode.substring(2, 4) === '01';
          const bIsGroup = b.pogCode.substring(2, 4) === '01';
          
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

        const departmentDivisions = organizations.filter(org => 
          this.isDivision(org.pogCode) && 
          org.pogCode.charAt(0) === mainCode.charAt(0) &&
          org.pogCode.substring(0, 2) === dept.pogCode.substring(0, 2)
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

          const divisionSections = organizations.filter(org => 
            this.isSection(org.pogCode) && 
            org.pogCode.charAt(0) === mainCode.charAt(0) &&
            org.pogCode.substring(0, 4) === div.pogCode.substring(0, 4)
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

    employees.forEach((emp) => {
      const orgCode = emp.pogCode;
      if (!orgCode) return;
      if (!grouped.has(orgCode)) {
        grouped.set(orgCode, []);
      }

      const isDeputy =
        emp.isDeputyRow === true ||
        emp.isDeputyRow === 1 ||
        emp.isDeputyRow === '1' ||
        emp.isDeputy === true;

      if (isDeputy) {
        const gpdPog = String(orgCode).trim();
        const r = emp as Record<string, unknown>;
        const deputy = buildEmployeeDeputyPublic({
          deputyOrganize:
            r.orgRefPogCode != null && String(r.orgRefPogCode).trim() !== ''
              ? {
                  pogCode: r.orgRefPogCode as string,
                  pogDesc: r.orgRefPogDesc as string,
                  pogAbbreviation: r.orgRefPogAbbreviation as string,
                  pogDescE: r.orgRefPogDescE as string,
                  pogType: r.orgRefPogType as string,
                  pogPosname: r.orgRefPogPosname as string,
                }
              : undefined,
          deputyExecutive:
            r.pexRefPpeCode != null && String(r.pexRefPpeCode).trim() !== ''
              ? {
                  ppeCode: r.pexRefPpeCode as string,
                  ppeDescT: r.pexRefPpeDescT as string,
                  ppeDescE: r.pexRefPpeDescE as string,
                  ppeWeight: r.pexRefPpeWeight as string,
                  ppePosLev: r.pexRefPpePosLev as string,
                }
              : undefined,
        });
        grouped.get(orgCode)!.push({
          pmtCode: String(emp.pmtCode ?? ''),
          pmtNameT: String(emp.pmtNameT ?? ''),
          pmtNameE: String(emp.pmtNameE ?? ''),
          pmtPosNo: String(emp.gdpDeputyPositionEx ?? emp.pmtPosNo ?? ''),
          pmtLevelCode: String(emp.pmtLevelCode ?? ''),
          positionName: String(r.pexRefPpeDescT ?? '').trim() || '',
          organizationPogCode: gpdPog,
          isDeputy: true,
          gpdDeputyPogCode: gpdPog,
          gdpDeputyPriority:
            emp.gdpDeputyPriority != null ? Number(emp.gdpDeputyPriority) : undefined,
          originalPogCode: emp.abDeputyOrigPogCode
            ? String(emp.abDeputyOrigPogCode).trim()
            : undefined,
          originalPogDesc: emp.abDeputyOrigPogDesc
            ? String(emp.abDeputyOrigPogDesc).trim()
            : undefined,
          originalPositionName: String(emp.originalPosPositionname ?? '').trim() || undefined,
          deputy,
        } as Employee);
        return;
      }

      const employeeData: Employee = emp.pmtCode
        ? {
            pmtCode: emp.pmtCode,
            pmtNameT: emp.pmtNameT,
            pmtNameE: emp.pmtNameE,
            pmtPosNo: emp.pmtPosNo,
            pmtLevelCode: emp.pmtLevelCode,
            positionName: emp.posPositionname || '',
            organizationPogCode: String(orgCode).trim(),
          }
        : {
            pmtCode: emp.phtCode,
            pmtNameT: emp.phtNameT,
            pmtNameE: emp.phtNameE,
            pmtPosNo: emp.phtPosNo,
            pmtLevelCode: emp.phtLevelCode,
            positionName: emp.headPositionname || '',
            organizationPogCode: String(orgCode).trim(),
          };

      grouped.get(orgCode)!.push(employeeData);
    });

    grouped.forEach((list) => {
      list.sort((a, b) => {
        const ad = a.isDeputy ? 1 : 0;
        const bd = b.isDeputy ? 1 : 0;
        if (ad !== bd) return bd - ad;
        if (ad === 1) {
          const pa = a.gdpDeputyPriority ?? 0;
          const pb = b.gdpDeputyPriority ?? 0;
          if (pa !== pb) return pa - pb;
        }
        return this.compareEmployeesByPmtLevelThenName(a, b);
      });
    });

    return grouped;
  }

  private compareEmployeesByPmtLevelThenName(a: Employee, b: Employee): number {
    const sa = String(a.pmtLevelCode ?? '').trim();
    const sb = String(b.pmtLevelCode ?? '').trim();
    const byLevel = sb.localeCompare(sa, 'th', { numeric: true });
    if (byLevel !== 0) return byLevel;
    return String(a.pmtNameT ?? '').localeCompare(String(b.pmtNameT ?? ''), 'th');
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