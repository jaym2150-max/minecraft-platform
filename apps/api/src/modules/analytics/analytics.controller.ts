import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  async getProjectAnalytics(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('period') period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d',
  ) {
    // IDOR guard: analytics are private to the project owner / staff. Before
    // this, an authenticated user could read analytics for ANY projectId
    // (including draft / other authors' projects) by passing ?projectId=. The
    // id is now a path param AND the service enforces the owner-or-staff rule.
    const data = await this.analyticsService.getProjectAnalytics(projectId, period, {
      requesterId: userId,
      requesterRole: role,
    });
    if (!data) {
      // Hide existence of private projects behind a 403 so callers can't
      // distinguish "no such project" from "not yours".
      throw new ForbiddenException("You do not have access to this project's analytics");
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Project analytics retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserAnalytics(
    @CurrentUser('id') userId: string,
    @Query('period') period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d',
  ) {
    const data = await this.analyticsService.getUserAnalytics(userId, period);
    return {
      statusCode: HttpStatus.OK,
      message: 'User analytics retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async getPlatformAnalytics(@Query('period') period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') {
    const data = await this.analyticsService.getPlatformAnalytics(period);
    return {
      statusCode: HttpStatus.OK,
      message: 'Platform analytics retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
