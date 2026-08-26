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
import { GuidesService } from './guides.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsOptional, IsString } from 'class-validator';

class CreateGuideDto {
  @IsString() title!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() status?: string;
}
class UpdateGuideDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() status?: string;
}

@Controller()
export class GuidesController {
  constructor(private readonly guides: GuidesService) {}

  @Public()
  @Get('guides')
  async list(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.guides.list({
      category,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Guides retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('guides/:slug')
  async get(@Param('slug') slug: string) {
    const data = await this.guides.get(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guide retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Post('guides')
  async create(@Body() dto: CreateGuideDto, @CurrentUser('id') userId: string) {
    const data = await this.guides.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Guide created',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Patch('guides/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateGuideDto) {
    const data = await this.guides.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guide updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete('guides/:id')
  async remove(@Param('id') id: string) {
    await this.guides.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guide deleted',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('guides/seed')
  @HttpCode(HttpStatus.OK)
  async seed() {
    const count = await this.guides.seed();
    return {
      statusCode: HttpStatus.OK,
      message: `Seeded ${count} guides`,
      data: { count },
      timestamp: new Date().toISOString(),
    };
  }
}
