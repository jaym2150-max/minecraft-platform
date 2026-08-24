import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.categoriesService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Categories retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
