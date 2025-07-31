import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User & { employee?: any };
}

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get employee notifications',
    description: 'Retrieve notifications for the authenticated employee',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'isRead',
    type: Boolean,
    required: false,
    description: 'Filter by read status',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isRead') isRead?: boolean,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }

    return this.notificationService.getNotifications(
      req.user.employee.code,
      page,
      limit,
      isRead,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Get the count of unread notifications for the authenticated employee',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 5,
        },
      },
    },
  })
  async getUnreadCount(@Req() req: RequestWithUser) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }

    const count = await this.notificationService.getUnreadCount(
      req.user.employee.code,
    );

    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification marked as read successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }

    await this.notificationService.markAsRead(id, req.user.employee.code);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Mark all notifications for the authenticated employee as read',
  })
  @ApiResponse({
    status: 204,
    description: 'All notifications marked as read successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@Req() req: RequestWithUser) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }

    await this.notificationService.markAllAsRead(req.user.employee.code);
  }
}
