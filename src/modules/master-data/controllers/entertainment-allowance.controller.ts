import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
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
    summary: 'Get all entertainment allowances',
    description:
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองทั้งหมด สามารถกรองข้อมูลด้วย query parameters ได้',
  })
  @ApiOkResponse({
    description: 'List of entertainment allowances',
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
          },
        ],
        meta: {
          total: 1,
          lastPage: 1,
          currentPage: 1,
          perPage: 10,
          prev: null,
          next: null,
        },
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
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองตาม id พร้อมข้อมูลสิทธิ์ที่ได้รับ (levels)',
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
            privilegeId: 1,
            privilegeName: 'ประธานกรรมการ',
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 2,
            allowanceId: 1,
            privilegeId: 2,
            privilegeName: 'กรรมการ',
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
      'สร้างข้อมูลสิทธิ์ค่าเลี้ยงรับรองใหม่ พร้อมระบุสิทธิ์ที่ได้รับ (levels) หากสิทธิ์มีการใช้งานอยู่แล้วจะไม่สามารถสร้างซ้ำได้',
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
          levels: [{ privilegeId: 3 }, { privilegeId: 4 }],
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
            privilegeId: 3,
            privilegeName: 'ผู้อำนวยการ',
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
          {
            id: 4,
            allowanceId: 2,
            privilegeId: 4,
            privilegeName: 'รองผู้อำนวยการ',
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Privilege already in use',
    schema: {
      example: {
        success: false,
        message:
          'Privilege (privilegeId=1) is already in use by allowance_id=1',
      },
    },
  })
  async create(@Body() dto: CreateEntertainmentAllowanceDto) {
    const result = await this.entertainmentAllowanceService.create(dto);
    if (result && result.success === false) {
      throw new BadRequestException({
        ...result,
      });
    }
    return result;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update entertainment allowance',
    description:
      'อัปเดตข้อมูลสิทธิ์ค่าเลี้ยงรับรองและระดับตำแหน่ง (levels) หาก level มีการใช้งานอยู่แล้วจะไม่สามารถอัปเดตซ้ำได้',
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
  @ApiResponse({
    status: 400,
    description: 'Level already in use',
    schema: {
      example: {
        success: false,
        message: 'Level (positionLevel=9) is already in use by allowance_id=1',
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateEntertainmentAllowanceDto,
  ) {
    const result = await this.entertainmentAllowanceService.update(
      Number(id),
      dto,
    );
    if (result && result.success === false) {
      throw new BadRequestException({
        ...result,
      });
    }
    return result;
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

  @Get('by-privilege/:privilegeId')
  @ApiOperation({
    summary: 'Get entertainment allowances by privilege ID',
    description:
      'ดึงข้อมูลสิทธิ์ค่าเลี้ยงรับรองทั้งหมดที่มีสิทธิ์ (privilegeId) ที่ระบุ พร้อมข้อมูล levels',
  })
  @ApiOkResponse({
    description:
      'List of entertainment allowances with the specified privilege',
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
              privilegeId: 1,
              privilegeName: 'ประธานกรรมการ',
              createdAt: '2024-06-16T00:00:00.000Z',
              updatedAt: '2024-06-16T00:00:00.000Z',
            },
            {
              id: 2,
              allowanceId: 1,
              privilegeId: 2,
              privilegeName: 'กรรมการ',
              createdAt: '2024-06-16T00:00:00.000Z',
              updatedAt: '2024-06-16T00:00:00.000Z',
            },
          ],
        },
      ],
    },
  })
  async getWithPrivilege(@Param('privilegeId') privilegeId: number) {
    return this.entertainmentAllowanceService.getWithPrivilege(
      Number(privilegeId),
    );
  }
}
