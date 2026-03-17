import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { MssqlService } from '../../database/mssql-service/mssql.service';

@ApiTags('Cron Jobs')
@Controller('cron')
export class CronController {
  constructor(
    private readonly cronService: CronService,
    private readonly mssqlService: MssqlService,
  ) {}

  /**
   * เทสการเชื่อมต่อ MSSQL เท่านั้น — ใช้เสร็จแล้วลบ endpoint นี้ได้
   * ไฟล์ที่แก้: src/modules/cron/cron.controller.ts (ลบ method นี้และ import MssqlService ถ้าไม่ใช้ที่อื่น)
   */
  @Get('mssql-test')
  @ApiOperation({ summary: '[เทสเท่านั้น] ตรวจสอบการเชื่อมต่อ MSSQL' })
  async testMssqlConnection() {
    const result = await this.mssqlService.knex.raw('SELECT 1 AS ok');
    return { ok: true, mssql: 'connected', result: result?.[0] ?? result };
  }
}
