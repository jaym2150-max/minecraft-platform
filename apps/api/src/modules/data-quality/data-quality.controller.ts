import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DataQualityService, type ScanResult } from './data-quality.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsIn } from 'class-validator';

class SetStatusDto {
  @IsIn(['OPEN', 'IGNORED', 'RESOLVED'])
  status!: 'OPEN' | 'IGNORED' | 'RESOLVED';
}

@Controller('data-quality')
export class DataQualityController {
  constructor(private readonly svc: DataQualityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Get('issues')
  async list(
    @Query('kind') kind?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.svc.listIssues({
      kind,
      status,
      projectId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return {
      statusCode: 200,
      message: 'Data quality issues retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Get('summary')
  async summary() {
    const data = await this.svc.summary();
    return {
      statusCode: 200,
      message: 'Data quality summary retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Post('scan')
  async scan(): Promise<any> {
    const data = await this.svc.runFullScan();
    return {
      statusCode: 200,
      message: 'Data quality scan finished',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Put('issues/:id/status')
  async setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto,
    @CurrentUser('id') actorId: string,
  ) {
    const data = await this.svc.setStatus(id, dto.status, actorId);
    return {
      statusCode: 200,
      message: 'Issue status updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('duplicates')
  async duplicates(@Query('slug') slug?: string) {
    if (!slug) {
      return {
        statusCode: 400,
        message: 'slug query param is required',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const data = await this.svc.findDuplicates(slug);
    return {
      statusCode: 200,
      message: 'Duplicates retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
