import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators/public.decorator';
import { IsOptional, IsString } from 'class-validator';

class SemanticSearchDto {
  @IsString() q!: string;
  @IsOptional() @IsString() limit?: string;
}
class ModpackRecommendDto {
  @IsString() prompt!: string;
  @IsOptional() @IsString() limit?: string;
}
class TroubleshootDto {
  @IsString() prompt!: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Public()
  @Get('semantic-search')
  async semanticSearch(@Query('q') q?: string, @Query('limit') limit?: string): Promise<any> {
    if (!q || !q.trim())
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'q is required',
        data: null,
        timestamp: new Date().toISOString(),
      };
    const data = await this.ai.semanticSearch(q, limit ? parseInt(limit, 10) : 12);
    return {
      statusCode: HttpStatus.OK,
      message: 'Semantic search results',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('modpack-recommend')
  @HttpCode(HttpStatus.OK)
  async modpackRecommend(@Body() dto: ModpackRecommendDto): Promise<any> {
    const data = await this.ai.recommendForModpack(
      dto.prompt,
      dto.limit ? parseInt(dto.limit, 10) : 8,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack recommendations',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('summarize/:slug')
  async summarize(@Param('slug') slug: string) {
    const data = await this.ai.summarizeMod(slug);
    if (!data)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Project not found',
        data: null,
        timestamp: new Date().toISOString(),
      };
    return {
      statusCode: HttpStatus.OK,
      message: 'Summary',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('compatibility/:slug')
  async compatibility(
    @Param('slug') slug: string,
    @Query('gameVersion') gameVersion?: string,
    @Query('loader') loader?: string,
  ) {
    const data = await this.ai.explainCompatibility(slug, gameVersion, loader);
    if (!data)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Project not found',
        data: null,
        timestamp: new Date().toISOString(),
      };
    return {
      statusCode: HttpStatus.OK,
      message: 'Compatibility explanation',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('troubleshoot')
  @HttpCode(HttpStatus.OK)
  async troubleshoot(@Body() dto: TroubleshootDto) {
    const data = await this.ai.troubleshooting(dto.prompt);
    return {
      statusCode: HttpStatus.OK,
      message: 'Troubleshooting answer',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
