import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InstallGuidesService } from './install-guides.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class CreateTemplateDto {
  @IsString() loader!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsString() body!: string;
  @IsOptional() @IsBoolean() recommended?: boolean;
}
class UpdateTemplateDto {
  @IsOptional() @IsString() loader?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsBoolean() recommended?: boolean;
}

@Controller()
export class InstallGuidesController {
  constructor(private readonly guides: InstallGuidesService) {}

  @Public()
  @Get('install-guides/templates')
  async list() {
    const data = await this.guides.list();
    return {
      statusCode: HttpStatus.OK,
      message: 'Install guide templates retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('install-guides/templates/:id')
  async get(@Param('id') id: string) {
    const data = await this.guides.get(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Post('install-guides/templates')
  async create(@Body() dto: CreateTemplateDto) {
    const data = await this.guides.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Template created',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Patch('install-guides/templates/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const data = await this.guides.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete('install-guides/templates/:id')
  async remove(@Param('id') id: string) {
    await this.guides.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template deleted',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('install-guides/templates/seed')
  async seed() {
    const count = await this.guides.seedDefaults();
    return {
      statusCode: HttpStatus.OK,
      message: `Seeded ${count} templates`,
      data: { count },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('projects/:projectId/install-guide')
  async forProject(@Param('projectId') projectId: string) {
    const data = await this.guides.renderForProject(projectId);
    if (!data) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No install guide available for this project',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Install guide rendered',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
