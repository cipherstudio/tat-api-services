export class DataReportTransportationDto {
  readonly transportId?: number;
  readonly formId?: number;
  readonly type?: string;
  readonly fromPlace?: string;
  readonly toPlace?: string;
  readonly date?: string;
  readonly amount?: number;
  readonly receiptFilePath?: string;
}
