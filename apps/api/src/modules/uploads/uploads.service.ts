import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { ScanStatus, VersionStatus } from '@prisma/client';
import { sanitizeObjectKey } from '../../common/utils/sanitize-filename';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly maxFileSize: number;
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  /**
   * Allowed file signatures (magic bytes) for Minecraft mod uploads.
   * JAR files are structurally ZIP archives (PK\x03\x04), so both the
   * empty-archive (PK\x05\x06) and spanned (PK\x07\x08) signatures are accepted.
   * Validation is done by inspecting the actual file bytes, NOT the client-
   * supplied MIME type (which is trivially spoofable).
   */
  private static readonly ALLOWED_SIGNATURES: ReadonlyArray<{
    bytes: number[];
    description: string;
  }> = [
    { bytes: [0x50, 0x4b, 0x03, 0x04], description: 'ZIP / JAR archive' },
    { bytes: [0x50, 0x4b, 0x05, 0x06], description: 'empty ZIP / JAR archive' },
    { bytes: [0x50, 0x4b, 0x07, 0x08], description: 'spanned ZIP / JAR archive' },
  ];

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @InjectQueue('virus-scan') private virusScanQueue: Queue,
  ) {
    // Default 25MB — matches the controller-level multer limit. Earlier
    // defaults (50MB) allowed an authenticated user to pin a worker / OOM
    // the API by sending many concurrent uploads. Configurable upward only
    // via MAX_UPLOAD_SIZE env; the controller cap is the hard ceiling.
    this.maxFileSize =
      this.config.get<number>('MAX_UPLOAD_SIZE') ?? 25 * 1024 * 1024;
    this.endpoint = this.config.get<string>('storage.endpoint')!;
    this.bucket = this.config.get<string>('storage.bucket')!;
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

  /**
   * Verify the file by its magic bytes rather than the (spoofable) MIME header.
   * Returns true if the leading bytes match a known archive signature.
   */
  private hasValidSignature(file: Express.Multer.File): boolean {
    const buf = file.buffer;
    if (!buf || buf.length < 4) return false;
    return UploadsService.ALLOWED_SIGNATURES.some(({ bytes }) =>
      bytes.every((b, i) => buf[i] === b),
    );
  }

  async initiateUpload(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Max size is ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }

    // Verify the file by its actual content (magic bytes), not the client-
    // supplied MIME type which can be trivially spoofed.
    if (!this.hasValidSignature(file)) {
      throw new BadRequestException(
        'Invalid file type. Only .jar and .zip archives are allowed.',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, authorId: true },
    });
    if (!project) {
      throw new BadRequestException(`Project with id "${projectId}" not found`);
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException(
        'You can only upload files to your own projects',
      );
    }

    // Compute the SHA-256 hash from the in-memory buffer before uploading so
    // the hash is authoritative (not derived from a remote object we don't
    // control yet).
    const hash = createHash('sha256').update(file.buffer).digest('hex');

    const uploadId = uuidv4();
    // Sanitize the original filename so it cannot escape the object key prefix
    // or inject path separators into the S3 key.
    const safeName = sanitizeObjectKey(file.originalname);
    const objectKey = `projects/${projectId}/uploads/${uploadId}-${safeName}`;

    this.logger.log(
      `Upload initiated: ${uploadId} for project ${projectId} by user ${userId} (${file.size} bytes)`,
    );

    // Stream the buffer directly to object storage here. The buffer lives only
    // in-process and is never serialized into a BullMQ job (which would drop it
    // / balloon Redis memory). Downstream workers operate on the stored object.
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: 'application/java-archive',
        // Force a download rather than an inline render, and pin the Content-Type
        // against browser MIME sniffing. Without `Content-Disposition: attachment`
        // an attacker-controlled object could be served inline by a misconfigured
        // edge and turn into a stored-XSS / active-content vector.
        ContentDisposition: 'attachment',
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: {
          'upload-id': uploadId,
          'project-id': projectId,
          sha256: hash,
          'original-filename': safeName,
          'uploaded-by': userId,
        },
      }),
    );

    const fileUrl = `${this.endpoint}/${this.bucket}/${objectKey}`;

    // Persist a ProjectVersion row up front so the virus scanner can target a
    // stable primary key (id) rather than matching on (projectId, fileUrl),
    // which is fragile and non-unique. The version stays SUBMITTED / scan
    // PENDING until the worker resolves the scan outcome.
    const projectVersion = await this.prisma.projectVersion.create({
      data: {
        projectId,
        version: uploadId,
        fileUrl,
        fileSize: file.size,
        hash: `sha256:${hash}`,
        filename: safeName,
        status: VersionStatus.SUBMITTED,
        scanStatus: ScanStatus.PENDING,
      },
      select: { id: true },
    });
    const projectVersionId = projectVersion.id;

    // Enqueue a virus scan. The worker reads the object back from storage; no
    // buffer is passed through Redis.
    try {
      await this.virusScanQueue.add(
        'scan-upload',
        {
          uploadId,
          projectId,
          projectVersionId,
          userId,
          filename: safeName,
          size: file.size,
          objectKey,
          fileUrl,
          hash: `sha256:${hash}`,
        },
        {
          // C19 (AUDIT.md): the jobId was `scan:${projectVersionId}` here but
          // getUploadStatus/cancelUpload looked the job up by `uploadId` — so
          // the status endpoint ALWAYS returned `status: 'unknown'` and the
          // cancel endpoint silently no-op'd, even though the scan job was
          // in flight. We key the job on `scan:${uploadId}` so the consumer
          // API surface (`uploadId` URL param) actually resolves to the
          // enqueued job. projectVersionId still lives in job.data for the
          // worker's DB lookup.
          jobId: `scan:${uploadId}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      );
    } catch (err) {
      this.logger.warn(
        `Failed to enqueue virus scan for upload=${uploadId} (projectVersionId=${projectVersionId}): ${(err as Error).message}`,
      );
    }

    return {
      uploadId,
      projectVersionId,
      objectKey,
      fileUrl,
      filename: safeName,
      size: file.size,
      hash: `sha256:${hash}`,
      status: 'uploaded',
      scanStatus: 'pending',
      message: 'Upload stored and queued for malware scanning',
    };
  }

  async getUploadStatus(uploadId: string, userId: string): Promise<any> {
    // C19: the job is keyed `scan:${uploadId}` when enqueued; look it up by
    // the same key so the consumer API surface actually resolves.
    const job = await this.virusScanQueue.getJob(`scan:${uploadId}`);

    if (!job) {
      return { uploadId, status: 'unknown' };
    }

    // Do not leak other users' upload metadata.
    if (job.data?.userId && job.data.userId !== userId) {
      throw new NotFoundException(`Upload with id "${uploadId}" not found`);
    }

    const state = await job.getState();
    return {
      uploadId,
      status: state,
      progress: job.progress,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    };
  }

  async cancelUpload(uploadId: string, userId: string): Promise<void> {
    // C19: the job is keyed `scan:${uploadId}` — match the producer.
    const job = await this.virusScanQueue.getJob(`scan:${uploadId}`);

    if (job) {
      if (job.data?.userId && job.data.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own uploads');
      }
      await job.remove();
      this.logger.log(`Upload ${uploadId} cancelled by user ${userId}`);
    }
  }
}
