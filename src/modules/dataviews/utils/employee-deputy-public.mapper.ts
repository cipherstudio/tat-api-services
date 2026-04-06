import type { EmployeeDeputyPublic } from '../entities/ab-deputy.entity';

/** รูปเดียวกับ `mapDeputiesForEmployeeResponse` ต่อ 1 รายการ — ใช้กับ employee API (`deputies[]`) และ org structure (`deputy`) */
export function buildEmployeeDeputyPublic(input: {
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
}): EmployeeDeputyPublic {
  const out: EmployeeDeputyPublic = {};
  if (input.deputyOrganize) {
    const o = input.deputyOrganize;
    out.deputyOrganize = {
      pogCode: o.pogCode,
      pogDesc: o.pogDesc,
      pogAbbreviation: o.pogAbbreviation,
      pogDescE: o.pogDescE,
      pogType: o.pogType,
      pogPosname: o.pogPosname,
    };
  }
  if (input.deputyExecutive) {
    const x = input.deputyExecutive;
    out.deputyExecutive = {
      ppeCode: x.ppeCode,
      ppeDescT: x.ppeDescT,
      ppeDescE: x.ppeDescE,
      ppeWeight: x.ppeWeight,
      ppePosLev: x.ppePosLev,
    };
  }
  return out;
}
