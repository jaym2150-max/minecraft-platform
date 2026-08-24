import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportStatus } from '@prisma/client';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReport(@Body() dto: CreateReportDto, @CurrentUser('id') userId: string) {
    const data = await this.moderationService.createReport(userId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Report submitted successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'OWNER')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: ReportStatus,
  ) {
    const { data, meta } = await this.moderationService.findAllReports(
      Number(page),
      Number(limit),
      status,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Reports retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'OWNER')
  async getStats() {
    const data = await this.moderationService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Moderation stats retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'OWNER')
  async findOne(@Param('id') id: string) {
    const data = await this.moderationService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Report retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reports/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.moderationService.resolve(id, userId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Report resolved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
