import { PartialType } from '@nestjs/swagger';
import { CreateMeetRateDto } from './create-meet-rate.dto';

export class UpdateMeetRateDto extends PartialType(CreateMeetRateDto) {}
