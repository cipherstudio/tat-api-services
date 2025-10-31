import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CronService } from './cron.service';

@ApiTags('Cron Jobs')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}
}
