import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto, UpdateGalleryItemDto, ReorderGalleryDto } from './dto/gallery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('projects/:slug/gallery')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('slug') slug: string) {
    const data = await this.galleryService.findByProject(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Gallery items retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('projects/:slug/gallery')
  @UseGuards(JwtAuthGuard)
  // Hard multer limits so a multi-GB multipart body cannot be buffered into
  // RAM before the service-level MAX_IMAGE_SIZE check fires (DoS/OOM). The
  // individual fileSize cap matches MAX_IMAGE_SIZE (10 MB); `fields` /
  // `parts` bound the metadata dimension of the multipart request;
  // `headerPairs` bounds the multipart header pairs (replaces the older
  // `headerSize` field).
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
        fields: 16,
        parts: 32,
        headerPairs: 32,
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateGalleryItemDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.galleryService.upload(slug, userId, file, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Gallery item uploaded',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('gallery/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryItemDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.galleryService.update(id, userId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Gallery item updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('gallery/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.galleryService.remove(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Gallery item deleted',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('projects/:slug/gallery/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Param('slug') slug: string,
    @Body() dto: ReorderGalleryDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.galleryService.reorder(slug, userId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Gallery reordered',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
