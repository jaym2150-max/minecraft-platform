import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async overview() {
    const data = await this.statisticsService.overview();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('random/projects')
  @HttpCode(HttpStatus.OK)
  async randomProjects(@Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number) {
    const projects = await this.statisticsService.randomProjects(count);
    return {
      statusCode: HttpStatus.OK,
      message: 'Random projects retrieved successfully',
      data: projects,
      timestamp: new Date().toISOString(),
    };
  }
}
