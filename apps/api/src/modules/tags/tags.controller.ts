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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsOptional, IsString } from 'class-validator';

class CreateTagDto {
  @IsString() name!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
}
class UpdateTagDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
}

@Controller()
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Public()
  @Get('tags')
  async list(@Query('search') search?: string) {
    const data = await this.tags.list(search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tags retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('tags/:slug')
  async get(@Param('slug') slug: string) {
    const data = await this.tags.get(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tag retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('tags')
  async create(@Body() dto: CreateTagDto) {
    const data = await this.tags.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tag created',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Patch('tags/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    const data = await this.tags.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tag updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete('tags/:id')
  async remove(@Param('id') id: string) {
    await this.tags.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tag deleted',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('projects/:projectId/tags')
  async listForProject(@Param('projectId') projectId: string) {
    const data = await this.tags.listForProject(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project tags retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('projects/:projectId/tags')
  @HttpCode(HttpStatus.CREATED)
  async attach(@Param('projectId') projectId: string, @Body() body: { tagId: string }) {
    const data = await this.tags.attach(projectId, body.tagId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tag attached',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete('projects/:projectId/tags/:tagId')
  async detach(@Param('projectId') projectId: string, @Param('tagId') tagId: string) {
    await this.tags.detach(projectId, tagId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tag detached',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('tags/seed')
  async seed() {
    const count = await this.tags.seedDefaults();
    return {
      statusCode: HttpStatus.OK,
      message: `Seeded ${count} tags`,
      data: { count },
      timestamp: new Date().toISOString(),
    };
  }
}
