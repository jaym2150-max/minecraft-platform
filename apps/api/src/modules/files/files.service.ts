import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnDomain: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('storage.bucket')!;
    this.cdnDomain = this.config.get<string>('CDN_DOMAIN', '');
    this.s3 = new S3Client({
      endpoint: this.config.get<string>('storage.endpoint'),
      region: this.config.get<string>('storage.region'),
      credentials: {
        accessKeyId: this.config.get<string>('storage.accessKey')!,
        secretAccessKey: this.config.get<string>('storage.secretKey')!,
      },
      forcePathStyle: true,
    });
  }

  async getDownloadUrl(objectKey: string): Promise<string> {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${this.bucket}/${objectKey}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  getObjectKeyFromUrl(fileUrl: string): string {
    const endpoint = this.config.get<string>('storage.endpoint')!;
    const prefix = `${endpoint}/${this.bucket}/`;
    if (fileUrl.startsWith(prefix)) {
      return fileUrl.slice(prefix.length);
    }
    return fileUrl;
  }
}
