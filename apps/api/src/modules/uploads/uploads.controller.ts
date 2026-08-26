import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Per-route cap on the upload endpoint. The global ThrottlerBehindProxyGuard
// is 100 req/min which is way too lax for a 25MB multipart endpoint — a
// single user could in theory exhaust worker bandwidth by hitting it
// repeatedly. Five uploads/minute per user is generous for a build CLI and
// makes trivial-DoS amplification uneconomic.
const UPLOAD_THROTTLE_LIMIT = 5;
const UPLOAD_THROTTLE_TTL_MS = 60_000;

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('project/:projectId')
  @HttpCode(HttpStatus.ACCEPTED)
  // Hard 25MB cap at the controller boundary. The service has its own
  // MAX_UPLOAD_SIZE check (read from config); they MUST agree — if you
  // change one, change both. The hard cap here is what short-circuits a
  // multi-GB body before it ever reaches the in-process Buffer, which is
  // the audit's "whole file buffered in RAM" concern: 50MB × N concurrent
  // requests is exactly how Node OOMs.
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  @Throttle({ default: { ttl: UPLOAD_THROTTLE_TTL_MS, limit: UPLOAD_THROTTLE_LIMIT } })
  async uploadFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const data = await this.uploadsService.initiateUpload(userId, projectId, file);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Upload accepted, processing queued',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':uploadId/status')
  async getStatus(@Param('uploadId') uploadId: string, @CurrentUser('id') userId: string) {
    const data = await this.uploadsService.getUploadStatus(uploadId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upload status retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':uploadId')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('uploadId') uploadId: string, @CurrentUser('id') userId: string) {
    await this.uploadsService.cancelUpload(uploadId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upload cancelled',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
