import { Controller, Get, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(
    @Query('q') q: string = '',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: string,
    @Query('loader') loader?: string,
    @Query('sort') sort?: string,
  ) {
    const { data, meta } = await this.searchService.search(q, {
      page: Number(page),
      limit: Number(limit),
      category,
      loader,
      sort,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Search completed',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async reindex() {
    const data = await this.searchService.reindexAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Reindex complete',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
