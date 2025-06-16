import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { EntertainmentAllowanceService } from '../services/entertainment-allowance.service';
import { CreateEntertainmentAllowanceDto } from '../dto/create-entertainment-allowance.dto';
import { UpdateEntertainmentAllowanceDto } from '../dto/update-entertainment-allowance.dto';
import { EntertainmentAllowanceQueryDto } from '../dto/entertainment-allowance-query.dto';

@ApiTags('Master Data')
@Controller('master-data/entertainment-allowance')
export class EntertainmentAllowanceController {
  constructor(
    private readonly entertainmentAllowanceService: EntertainmentAllowanceService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all entertainment allowances (with pagination)',
    description:
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองทั้งหมด พร้อมข้อมูลระดับตำแหน่ง (levels) และรองรับการแบ่งหน้า',
  })
  @ApiOkResponse({
    description: 'List of entertainment allowances with pagination meta',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title:
              'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
            minDays: 0,
            maxDays: 15,
            amount: 3000,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
            levels: [
              {
                id: 1,
                allowanceId: 1,
                positionLevel: 9,
                createdAt: '2024-06-16T00:00:00.000Z',
                updatedAt: '2024-06-16T00:00:00.000Z',
              },
              {
                id: 2,
                allowanceId: 1,
                positionLevel: 10,
                createdAt: '2024-06-16T00:00:00.000Z',
                updatedAt: '2024-06-16T00:00:00.000Z',
              },
            ],
          },
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(@Query() query: EntertainmentAllowanceQueryDto) {
    return this.entertainmentAllowanceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get entertainment allowance by id',
    description:
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองตาม id พร้อมข้อมูลระดับตำแหน่ง (levels)',
  })
  @ApiOkResponse({
    description: 'Entertainment allowance with the specified id',
    schema: {
      example: {
        id: 1,
        title:
          'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
        minDays: 0,
        maxDays: 15,
        amount: 3000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        levels: [
          {
            id: 1,
            allowanceId: 1,
            positionLevel: 9,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 2,
            allowanceId: 1,
            positionLevel: 10,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return this.entertainmentAllowanceService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({
    summary: 'Create entertainment allowance',
    description:
      'สร้างข้อมูลสิทธิ์ค่าเลี้ยงรับรองใหม่ พร้อมระบุระดับตำแหน่ง (levels)',
  })
  @ApiBody({
    type: CreateEntertainmentAllowanceDto,
    examples: {
      example1: {
        value: {
          title: 'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา',
          minDays: 0,
          maxDays: 15,
          amount: 2000,
          levels: [{ positionLevel: 3 }, { positionLevel: 4 }],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created entertainment allowance',
    schema: {
      example: {
        id: 2,
        title: 'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา',
        minDays: 0,
        maxDays: 15,
        amount: 2000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        levels: [
          {
            id: 3,
            allowanceId: 2,
            positionLevel: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 4,
            allowanceId: 2,
            positionLevel: 4,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async create(@Body() dto: CreateEntertainmentAllowanceDto) {
    return this.entertainmentAllowanceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update entertainment allowance',
    description: 'อัปเดตข้อมูลสิทธิ์ค่าเลี้ยงรับรองและระดับตำแหน่ง (levels)',
  })
  @ApiBody({
    type: UpdateEntertainmentAllowanceDto,
    examples: {
      example1: {
        value: {
          title: 'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา (แก้ไข)',
          minDays: 0,
          maxDays: 15,
          amount: 2500,
          levels: [
            { id: 3, positionLevel: 3 },
            { id: 4, positionLevel: 4 },
            { positionLevel: 5 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated entertainment allowance',
    schema: {
      example: {
        id: 2,
        title: 'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา (แก้ไข)',
        minDays: 0,
        maxDays: 15,
        amount: 2500,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        levels: [
          {
            id: 3,
            allowanceId: 2,
            positionLevel: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 4,
            allowanceId: 2,
            positionLevel: 4,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 5,
            allowanceId: 2,
            positionLevel: 5,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateEntertainmentAllowanceDto,
  ) {
    return this.entertainmentAllowanceService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete entertainment allowance',
    description:
      'ลบข้อมูลสิทธิ์ค่าเลี้ยงรับรองและระดับตำแหน่ง (levels) ทั้งหมดที่เกี่ยวข้อง',
  })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.entertainmentAllowanceService.remove(Number(id));
  }

  @Get('by-level/:level')
  @ApiOperation({
    summary: 'Get entertainment allowances by position level',
    description:
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองทั้งหมดที่มีระดับตำแหน่ง (positionLevel) ที่ระบุ พร้อมข้อมูล levels',
  })
  @ApiOkResponse({
    description:
      'List of entertainment allowances with the specified position level',
    schema: {
      example: [
        {
          id: 1,
          title:
            'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
          minDays: 0,
          maxDays: 15,
          amount: 3000,
          createdAt: '2024-06-16T00:00:00.000Z',
          updatedAt: '2024-06-16T00:00:00.000Z',
          levels: [
            {
              id: 1,
              allowanceId: 1,
              positionLevel: 9,
              createdAt: '2024-06-16T00:00:00.000Z',
              updatedAt: '2024-06-16T00:00:00.000Z',
            },
            {
              id: 2,
              allowanceId: 1,
              positionLevel: 10,
              createdAt: '2024-06-16T00:00:00.000Z',
              updatedAt: '2024-06-16T00:00:00.000Z',
            },
          ],
        },
      ],
    },
  })
  async getWithLevel(@Param('level') level: number) {
    return this.entertainmentAllowanceService.getWithLevel(Number(level));
  }
}
