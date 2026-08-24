import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddProjectDto } from './dto/add-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCollectionDto, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.create(userId, dto);
    return { statusCode: HttpStatus.CREATED, message: 'Collection created', data, timestamp: new Date().toISOString() };
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId?: string,
  ) {
    const result = await this.collectionsService.findAll({ userId, isPublic: true, page: Number(page), limit: Number(limit) });
    return { statusCode: HttpStatus.OK, message: 'Collections retrieved', ...result, timestamp: new Date().toISOString() };
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findMine(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.collectionsService.findAll({ userId, page: Number(page), limit: Number(limit) });
    return { statusCode: HttpStatus.OK, message: 'My collections retrieved', ...result, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    const data = await this.collectionsService.findOne(id, userId);
    return { statusCode: HttpStatus.OK, message: 'Collection retrieved', data, timestamp: new Date().toISOString() };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionDto, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.update(id, userId, dto);
    return { statusCode: HttpStatus.OK, message: 'Collection updated', data, timestamp: new Date().toISOString() };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.remove(id, userId);
    return { statusCode: HttpStatus.OK, message: 'Collection deleted', data, timestamp: new Date().toISOString() };
  }

  @Post(':id/projects')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addProject(@Param('id') id: string, @Body() dto: AddProjectDto, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.addProject(id, userId, dto.projectId, dto.notes);
    return { statusCode: HttpStatus.CREATED, message: 'Project added to collection', data, timestamp: new Date().toISOString() };
  }

  @Delete(':id/projects/:projectId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeProject(@Param('id') id: string, @Param('projectId') projectId: string, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.removeProject(id, userId, projectId);
    return { statusCode: HttpStatus.OK, message: 'Project removed from collection', data, timestamp: new Date().toISOString() };
  }
}
