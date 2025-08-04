import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemsAccessDto } from './create-menu-items-access.dto';

export class UpdateMenuItemsAccessDto extends PartialType(
  CreateMenuItemsAccessDto,
) {}
