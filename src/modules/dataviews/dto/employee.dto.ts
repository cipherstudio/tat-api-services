import { ApiProperty } from '@nestjs/swagger';
import { ViewPosition4otDto } from './view-position-4ot.dto';

export class EmployeeDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  khateCode: string;

  @ApiProperty()
  khate: string;

  @ApiProperty()
  provinceCode: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  postcode: string;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  birthDate: Date;

  @ApiProperty({ type: Number, required: false })
  salary: number;

  @ApiProperty()
  bankAccount: string;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  startWork: Date;

  @ApiProperty()
  pmtPosWork: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  apaPpnNumber: string;

  @ApiProperty()
  exPositionCode: string;

  @ApiProperty()
  exPosition: string;

  @ApiProperty()
  levelPosition: string;

  @ApiProperty()
  pogCode: string;

  @ApiProperty()
  workinggroup: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  division: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  father: string;

  @ApiProperty()
  fatherAlive: string;

  @ApiProperty()
  mother: string;

  @ApiProperty()
  motherAlive: string;

  @ApiProperty()
  mariried: string;

  @ApiProperty()
  spouse: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  typeData: string;

  @ApiProperty()
  cardId: string;

  @ApiProperty()
  taxId: string;

  @ApiProperty({ type: () => ViewPosition4otDto, required: false })
  position4ot?: ViewPosition4otDto;
}
