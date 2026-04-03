export interface ViewDependentBenefSpouseTatStaff {
  staffType: 'employee' | 'contractor';
  pmtCode?: string;
  pmtNameT?: string;
  pmtNameE?: string;
  pmtLevelCode?: string;
}

export interface ViewDependentBenef {
  depEmployeecode?: string;
  depNationcardid?: string;
  depDepbenef?: string;
  depEmployeeHrname?: string;
  depEmployeeFirstName?: string;
  depEmployeeLastName?: string;
  depHornorificname?: string;
  depFirstname?: string;
  depLastname?: string;
  depRelation?: string;
  depMarStatus?: string;
  depSex?: string;
  depBirthdate?: Date | string;
  depDeathDate?: Date | string;
  depEffDate?: Date | string;
  depRelationcount?: number;
  depBenNameEffDate?: Date | string;
  spouseTatStaff?: ViewDependentBenefSpouseTatStaff;
}

export type ViewDependentBenefPaginate = {
  data: ViewDependentBenef[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
