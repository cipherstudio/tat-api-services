import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTask() {
    this.logger.log('Cron job running');
    
    try {
      await this.copyReportDate();
      
      this.logger.log('Cron job completed');
    } catch (error) {
      this.logger.error('Cron job error:', error);
    }
  }


  private async copyReportDate(): Promise<void> {
    this.logger.log('Copying report date');
    // TODO: เพิ่มโค้ดสำหรับคัดลอกข้อมูลตรงนี้
    
  }
}
