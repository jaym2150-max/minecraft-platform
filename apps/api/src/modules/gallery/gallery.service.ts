import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { CreateGalleryItemDto, UpdateGalleryItemDto, ReorderGalleryDto } from './dto/gallery.dto';
import { GalleryItemType, ProjectStatus } from '@prisma/client';

const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed MIME types for gallery uploads. Kept deliberately tight — no SVG
 * (`image/svg+xml`), no HTML, no XML — because those formats can carry active
 * script content. The MIME is determined from the magic bytes, not from the
 * client-spoofable `file.mimetype` header, and only these types pass.
 */
const ALLOWED_IMAGE_MIME_TYPES = Object.keys(IMAGE_SIGNATURES);

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBucket: string;
  private readonly endpoint: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @InjectQueue('image-process') private imageProcessQueue: Queue,
  ) {
    this.endpoint = this.config.get<string>('storage.endpoint')!;
    this.bucket = this.config.get<string>('storage.bucket')!;
    this.publicBucket = this.config.get<string>('storage.publicBucket')!;
    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: this.config.get<string>('storage.region')!,
      credentials: {
        accessKeyId: this.config.get<string>('storage.accessKey')!,
        secretAccessKey: this.config.get<string>('storage.secretKey')!,
      },
      forcePathStyle: true,
    });
  }

  async findByProject(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Only reveal gallery images for PUBLISHED projects to anonymous callers.
    // Without this filter, a draft/private project whose slug is known would
    // leak its image URLs to any unauthenticated viewer. We throw the same
    // NotFound that `findUnique` produces for an unknown slug so the existence
    // of a non-published project is not disclosed.
    if (project.status !== ProjectStatus.PUBLISHED) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.galleryImage.findMany({
      where: { projectId: project.id },
      orderBy: { order: 'asc' },
    });
  }

  async upload(
    projectSlug: string,
    userId: string,
    file: Express.Multer.File,
    dto: CreateGalleryItemDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, authorId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.authorId !== userId) throw new ForbiddenException('Not your project');

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image too large. Max 10MB');
    }

    // Determine the MIME type from the bytes themselves, not from the
    // client-supplied `file.mimetype` (which is trivially spoofable). An
    // attacker setting `Content-Type: image/svg+xml` would otherwise get
    // past the magic-byte check because the legacy fallback OR-ed every
    // known signature together for an unknown MIME. Now we reject anything
    // that isn't a recognised raster image at the byte level — refusing
    // SVG/HTML payloads outright because they can carry inline script and
    // would be served back via the S3 host.
    const detectedMime = this.detectMimeFromBytes(file.buffer);
    if (!detectedMime) {
      throw new BadRequestException(
        'Invalid image type. Only PNG, JPEG, WEBP, and GIF are allowed.',
      );
    }

    const ext = this.getExtension(detectedMime);
    const itemId = uuidv4();
    const objectKey = `gallery/${project.id}/${itemId}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: detectedMime,
        // Force the browser to download the object rather than render it
        // inline, and pin the MIME so sniffing cannot downgrade a PNG into
        // `text/html` if the S3 host is ever fronted by a misconfigured edge.
        ContentDisposition: 'attachment',
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: {
          'gallery-item-id': itemId,
          'project-id': project.id,
          'uploaded-by': userId,
        },
      }),
    );

    const url = `${this.endpoint}/${this.bucket}/${objectKey}`;

    const maxOrder = await this.prisma.galleryImage.aggregate({
      where: { projectId: project.id },
      _max: { order: true },
    });

    const item = await this.prisma.galleryImage.create({
      data: {
        id: itemId,
        type: dto.type ?? GalleryItemType.IMAGE,
        url,
        alt: dto.alt,
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
        projectId: project.id,
      },
    });

    // Hand the worker only the S3 coordinate of the freshly-stored object,
    // never the bytes. Shipping file.buffer through BullMQ would load the
    // whole image into Redis RAM (and keep it there for the job's lifetime +
    // retries), which on a 10MB PNG scales badly and risks OOM under load.
    // The worker streams GetObject out of the private bucket, processes it,
    // and writes the public thumbnails into the public bucket.
    this.imageProcessQueue.add('process-image', {
      sourceKey: objectKey,
      sourceBucket: this.bucket,
      filename: `gallery/${itemId}${ext}`,
      mimeType: detectedMime,
      // Guard against a duplicate re-enqueue producing N redundant variant
      // sets for the same gallery item: dedup by the gallery item id.
    }, {
      jobId: `gallery-image:${itemId}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    }).catch((err) =>
      this.logger.warn(`Failed to enqueue image-process: ${err.message}`),
    );

    return item;
  }

  async update(id: string, userId: string, dto: UpdateGalleryItemDto) {
    const item = await this.prisma.galleryImage.findUnique({ where: { id }, include: { project: { select: { authorId: true } } } });
    if (!item) throw new NotFoundException('Gallery item not found');
    if (item.project.authorId !== userId) throw new ForbiddenException('Not your project');

    return this.prisma.galleryImage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.galleryImage.findUnique({ where: { id }, include: { project: { select: { authorId: true } } } });
    if (!item) throw new NotFoundException('Gallery item not found');
    if (item.project.authorId !== userId) throw new ForbiddenException('Not your project');

    try {
      const key = this.extractKeyFromUrl(item.url);
      if (key) {
        await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      }
    } catch (err) {
      this.logger.warn(`Failed to delete S3 object for gallery item ${id}: ${(err as Error).message}`);
    }

    await this.prisma.galleryImage.delete({ where: { id } });
    return { message: 'Gallery item deleted' };
  }

  async reorder(projectSlug: string, userId: string, dto: ReorderGalleryDto) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, authorId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.authorId !== userId) throw new ForbiddenException('Not your project');

    const updates = dto.ids.map((id, index) =>
      this.prisma.galleryImage.updateMany({
        where: { id, projectId: project.id },
        data: { order: index },
      }),
    );

    await Promise.all(updates);
    return { message: 'Gallery reordered' };
  }

  /**
   * Resolve the MIME type from the leading magic bytes and confirm it falls
   * within the strict allowlist. If the bytes match none of the known image
   * signatures (or match a format that we have deliberately NOT allowlisted,
   * like SVG), return `null` so the caller can reject the upload server-side.
   *
   * The previous implementation fell back to "OR every known signature
   * together" for an unknown client-supplied MIME, which let an attacker
   * pass off a header-prefixed HTML/SVG file as a gallery image and serve it
   * back via the S3 host with a sniffing-friendly Content-Type.
   */
  private detectMimeFromBytes(buf: Buffer | undefined): string | null {
    if (!buf || buf.length < 12) return null;
    for (const [mime, signatures] of Object.entries(IMAGE_SIGNATURES)) {
      const match = signatures.some((bytes) =>
        bytes.every((b, i) => buf[i] === b),
      );
      // For WEBP the RIFF four-bytes are not enough — the WEBP form type
      // ("WEBP") lives at bytes 8..11. Confirm it so a generic RIFF/WAVE
      // file can't masquerade as WEBP.
      if (match && mime === 'image/webp') {
        const form = buf.slice(8, 12).toString('ascii');
        if (form !== 'WEBP') continue;
      }
      if (match) return mime;
    }
    return null;
  }

  private getExtension(mime: string): string {
    const map: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return map[mime] ?? '.bin';
  }

  private extractKeyFromUrl(url: string): string | null {
    const prefix = `${this.endpoint}/${this.bucket}/`;
    if (url.startsWith(prefix)) return url.slice(prefix.length);
    return null;
  }
}
