import { PartialType } from '@nestjs/swagger';
import { CreateAttireDestinationGroupsDto } from './create-attire-destination-groups.dto';

export class UpdateAttireDestinationGroupsDto extends PartialType(CreateAttireDestinationGroupsDto) {} 