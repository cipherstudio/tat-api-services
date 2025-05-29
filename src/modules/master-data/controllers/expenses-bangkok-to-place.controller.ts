import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ExpensesBangkokToPlaceService } from '../services/expenses-bangkok-to-place.service';
import { UpsertExpensesBangkokToPlaceDto } from '../dto/upsert-expenses-bangkok-to-place.dto.js';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/expenses-bangkok-to-place')
export class ExpensesBangkokToPlaceController {
  constructor(private readonly expensesBangkokToPlaceService: ExpensesBangkokToPlaceService) {}

  @Post('bulk')
  @ApiBody({
    type: UpsertExpensesBangkokToPlaceDto,
    examples: {
      example1: {
        summary: 'ตัวอย่างการบันทึกอัตราเบิกจ่าย',
        value: {
          amphurId: 1,
          rates: [
            { placeId: 1, rate: 250 },
            { placeId: 2, rate: 300 },
            { placeId: 3, rate: 0 }
          ]
        }
      }
    }
  })
  async upsertBulk(@Body() dto: UpsertExpensesBangkokToPlaceDto) {
    return this.expensesBangkokToPlaceService.upsertBulk(dto);
  }

  @Get('amphur/:amphurId')
  async getRatesByAmphur(@Param('amphurId') amphurId: number) {
    return this.expensesBangkokToPlaceService.getRatesByAmphur(amphurId);
  }
} 