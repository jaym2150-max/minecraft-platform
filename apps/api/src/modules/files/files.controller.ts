import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { VersionsService } from '../versions/versions.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly versionsService: VersionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':versionId/download')
  @Public()
  @HttpCode(HttpStatus.OK)
  async download(
    @Param('versionId') versionId: string,
    @Req() req: Request,
  ) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
      select: { id: true, fileUrl: true, hash: true },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const userAgent = req.headers['user-agent'];
    const userId = (req as any).user?.id;

    await this.versionsService.incrementDownloads(
      versionId,
      ip,
      userAgent,
      userId,
    );

    const objectKey = this.filesService.getObjectKeyFromUrl(version.fileUrl);
    const downloadUrl = await this.filesService.getDownloadUrl(objectKey);

    return {
      statusCode: HttpStatus.OK,
      message: 'Download URL generated',
      data: {
        url: downloadUrl,
        hash: version.hash,
        hashAlgorithm: 'sha256',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':versionId/hash')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getHash(@Param('versionId') versionId: string) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
      select: { hash: true, fileSize: true },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'File hash retrieved',
      data: {
        hash: version.hash,
        hashAlgorithm: 'sha256',
        fileSize: version.fileSize,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
