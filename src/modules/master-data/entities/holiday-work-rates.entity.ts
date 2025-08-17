export class HolidayWorkRate {
  id: number;
  stepLevel: number;
  salary: number;
  createdAt: Date;
  updatedAt: Date;
  hours?: HolidayWorkHour[];
}

export class HolidayWorkHour {
  id: number;
  rateId: number;
  hour: number;
  workPay: number;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}
