import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ClothingExpenseCancellationRequestService } from '../services/clothing-expense-cancellation-request.service';
import { CreateClothingExpenseCancellationRequestDto } from '../dto/create-clothing-expense-cancellation-request.dto';
import { UpdateClothingExpenseCancellationRequestDto } from '../dto/update-clothing-expense-cancellation-request.dto';
import { ClothingExpenseCancellationRequestQueryDto } from '../dto/clothing-expense-cancellation-request-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: any & { employee?: { code: string; name: string } };
}

@ApiTags('Master Data')
@Controller('master-data/clothing-expense-cancellation-request')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClothingExpenseCancellationRequestController {
  constructor(
    private readonly clothingExpenseCancellationRequestService: ClothingExpenseCancellationRequestService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all clothing expense cancellation requests (with pagination)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'order_by', required: false, type: String, description: 'Order by field (default: created_at)' })
  @ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'], description: 'Order direction (default: desc)' })
  @ApiQuery({ name: 'approval_id', required: false, type: Number, description: 'Filter by approval ID' })
  @ApiQuery({ name: 'attachment_id', required: false, type: Number, description: 'Filter by attachment ID' })
  @ApiQuery({ name: 'creator_code', required: false, type: String, description: 'Filter by creator code' })
  @ApiQuery({ name: 'creator_name', required: false, type: String, description: 'Filter by creator name' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'], description: 'Filter by status' })
  @ApiQuery({ name: 'selected_staff_ids', required: false, type: String, description: 'Filter by selected staff IDs (JSON string)' })
  @ApiQuery({ name: 'isRelateToMe', required: false, type: Boolean, description: 'Filter records related to current employee' })
  @ApiOkResponse({
    description: 'List of clothing expense cancellation requests with pagination meta',
    schema: {
      example: {
        data: [
          {
            id: 1,
            approval_id: 123,
            attachment_id: 456,
            comment: 'Request to cancel clothing expense',
            creator_code: '66019',
            creator_name: 'John Doe',
            status: 'pending',
            selected_staff_ids: [1, 2, 3],
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            approval_document_title: 'Travel Request',
            approval_increment_id: 'TR001',
            attachment_original_name: 'document.pdf',
            attachment_file_path: '/uploads/document.pdf',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('search') search?: string,
    @Query('order_by') order_by?: string,
    @Query('direction') direction?: 'asc' | 'desc',
    @Query('approval_id', new ValidationPipe({ transform: true })) approval_id?: number,
    @Query('attachment_id', new ValidationPipe({ transform: true })) attachment_id?: number,
    @Query('creator_code') creator_code?: string,
    @Query('creator_name') creator_name?: string,
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Query('selected_staff_ids') selected_staff_ids?: string,
    @Query('isRelateToMe', new ValidationPipe({ transform: true })) isRelateToMe?: boolean,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }

    const queryOptions: ClothingExpenseCancellationRequestQueryDto = {
      page,
      limit,
      search,
      order_by,
      direction,
      approval_id,
      attachment_id,
      creator_code,
      creator_name,
      status,
      selected_staff_ids: selected_staff_ids ? JSON.parse(selected_staff_ids) : undefined,
      isRelateToMe,
    };

    return this.clothingExpenseCancellationRequestService.findAll(
      queryOptions, 
      req.user.employee.code
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clothing expense cancellation request by id' })
  @ApiOkResponse({
    description: 'Clothing expense cancellation request with the specified id',
    schema: {
      example: {
        id: 1,
        approval_id: 123,
        attachment_id: 456,
        comment: 'Request to cancel clothing expense',
        creator_code: '66019',
        creator_name: 'John Doe',
        status: 'pending',
        selected_staff_ids: [1, 2, 3],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        approval_document_title: 'Travel Request',
        approval_increment_id: 'TR001',
        attachment_original_name: 'document.pdf',
        attachment_file_path: '/uploads/document.pdf',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clothingExpenseCancellationRequestService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create clothing expense cancellation request' })
  @ApiBody({
    type: CreateClothingExpenseCancellationRequestDto,
    examples: {
      example1: {
        value: {
          approval_id: 123,
          attachment_id: 456,
          comment: 'Request to cancel clothing expense',
          creator_code: '66019',
          creator_name: 'John Doe',
          status: 'pending',
          selected_staff_ids: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created clothing expense cancellation request',
  })
  async create(@Body() dto: CreateClothingExpenseCancellationRequestDto) {
    return this.clothingExpenseCancellationRequestService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update clothing expense cancellation request' })
  @ApiBody({
    type: UpdateClothingExpenseCancellationRequestDto,
    examples: {
      example1: {
        value: {
          status: 'approved',
          comment: 'Request approved',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated clothing expense cancellation request',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClothingExpenseCancellationRequestDto,
  ) {
    return this.clothingExpenseCancellationRequestService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete clothing expense cancellation request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clothingExpenseCancellationRequestService.remove(id);
  }
}
