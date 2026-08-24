import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoadersService } from './loaders.service';
import { CreateLoaderDto } from './dto/create-loader.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { LoaderType } from '@prisma/client';

@Controller('loaders')
export class LoadersController {
  constructor(private readonly loadersService: LoadersService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.loadersService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Loaders retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('by-type')
  @HttpCode(HttpStatus.OK)
  async findByType(@Query('type') type: LoaderType) {
    const data = await this.loadersService.findByType(type);
    return {
      statusCode: HttpStatus.OK,
      message: 'Loaders retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('by-project/:projectId')
  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('projectId') projectId: string) {
    const data = await this.loadersService.findByProject(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Loaders retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateLoaderDto) {
    const data = await this.loadersService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Loader created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.loadersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Loader removed successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
