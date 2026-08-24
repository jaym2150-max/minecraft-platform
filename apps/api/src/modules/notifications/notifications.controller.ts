import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findByUser(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('unread') unread?: string,
  ) {
    const { data, meta } = await this.notificationsService.findByUser(
      userId,
      Number(page),
      Number(limit),
      unread === 'true',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.notificationsService.findOne(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.notificationsService.markAsRead(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification marked as read',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('id') userId: string) {
    const data = await this.notificationsService.markAllAsRead(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications marked as read',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  async clearAll(@CurrentUser('id') userId: string) {
    const data = await this.notificationsService.clearAll(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications cleared',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.notificationsService.remove(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification deleted',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNotificationDto) {
    const data = await this.notificationsService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notification created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
