// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';

const mockSharpInstance = {
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  webp: vi.fn().mockReturnThis(),
  png: vi.fn().mockReturnThis(),
  jpeg: vi.fn().mockReturnThis(),
  toBuffer: vi.fn(),
  metadata: vi.fn(),
};

const mockSharp = vi.fn(() => mockSharpInstance) as any;
mockSharp.cache = vi.fn();

const mockS3Send = vi.fn();

vi.mock('sharp', () => ({ default: mockSharp }));

vi.mock('@aws-sdk/client-s3', () => {
  function S3Client() {
    this.send = mockS3Send;
  }
  function GetObjectCommand(input: any) {
    this.kind = 'get';
    this.input = input;
  }
  function PutObjectCommand(input: any) {
    this.kind = 'put';
    this.input = input;
  }
  function DeleteObjectCommand(input: any) {
    this.kind = 'delete';
    this.input = input;
  }
  return {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
  };
});

vi.mock('bullmq', () => {
  function MockWorker() {
    this.on = vi.fn().mockReturnThis();
    this.run = vi.fn();
  }
  return { Worker: MockWorker, Job: vi.fn() };
});

vi.mock('ioredis', () => {
  function MockRedis() {
    this.ping = vi.fn();
    this.quit = vi.fn();
  }
  return { default: MockRedis };
});

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

const { processImage, DEFAULT_VARIANTS } = await import('../index.js');

describe('DEFAULT_VARIANTS', () => {
  it('has four standard variant sizes', () => {
    expect(DEFAULT_VARIANTS).toHaveLength(4);
    expect(DEFAULT_VARIANTS[0]).toEqual({
      name: 'thumbnail',
      width: 64,
      height: 64,
      quality: 80,
      format: 'webp',
    });
    expect(DEFAULT_VARIANTS[1]).toEqual({
      name: 'small',
      width: 128,
      height: 128,
      quality: 80,
      format: 'webp',
    });
    expect(DEFAULT_VARIANTS[2]).toEqual({
      name: 'medium',
      width: 256,
      height: 256,
      quality: 85,
      format: 'webp',
    });
    expect(DEFAULT_VARIANTS[3]).toEqual({
      name: 'large',
      width: 512,
      height: 512,
      quality: 85,
      format: 'webp',
    });
  });
});

describe('processImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSharp.mockClear();
    mockSharpInstance.rotate.mockClear();
    mockSharpInstance.resize.mockClear();
    mockSharpInstance.webp.mockClear();
    mockSharpInstance.png.mockClear();
    mockSharpInstance.jpeg.mockClear();
    mockSharpInstance.toBuffer.mockReset();
    mockSharpInstance.metadata.mockReset();
    mockS3Send.mockReset();
    // First S3 call is the source-object fetch (GetObject → streamed Body);
    // every later call is a PutObject for a generated variant.
    mockS3Send.mockImplementation(async (cmd: any) => {
      if (cmd?.kind === 'get') {
        return { Body: Readable.from(Buffer.from('fake-image-data')) };
      }
      return {};
    });
  });

  it('fetches the source from S3 and processes default variants', async () => {
    mockSharpInstance.metadata.mockResolvedValue({
      width: 1024,
      height: 768,
      format: 'png',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('variant-data'));

    const mockJob = {
      data: {
        sourceKey: 'img/test-image.png',
        sourceBucket: 'private-uploads',
        filename: 'test-image.png',
        mimeType: 'image/png',
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processImage(mockJob);

    expect(result.filename).toBe('test-image.png');
    expect(result.source).toEqual({
      width: 1024,
      height: 768,
      format: 'png',
    });
    expect(result.variants).toHaveLength(4);
    // 1 GetObject for the source + 4 PutObjects for the variants.
    expect(mockS3Send).toHaveBeenCalledTimes(5);
    expect(mockSharpInstance.rotate).toHaveBeenCalled();
  });

  it('uses custom variants when provided', async () => {
    mockSharpInstance.metadata.mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('thumb-data'));

    const customVariants = [
      { name: 'thumb', width: 100, height: 100, quality: 70, format: 'jpeg' as const },
    ];

    const mockJob = {
      data: {
        sourceKey: 'img/custom.jpg',
        filename: 'custom.jpg',
        mimeType: 'image/jpeg',
        variants: customVariants,
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processImage(mockJob);

    expect(result.variants).toHaveLength(1);
    expect(result.variants[0].name).toBe('thumb');
    expect(result.variants[0].format).toBe('jpeg');
    expect(mockSharpInstance.jpeg).toHaveBeenCalled();
  });

  it('rejects legacy inline-buffer payloads (memory-blowup vector)', async () => {
    const mockJob = {
      data: {
        buffer: Buffer.from('inline-bytes'),
        filename: 'legacy.png',
        mimeType: 'image/png',
      },
      updateProgress: vi.fn(),
    } as any;

    await expect(processImage(mockJob)).rejects.toThrow(
      'Inline buffer payloads are no longer accepted',
    );
  });

  it('reads from filePath when buffer not provided', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file-content'));

    mockSharpInstance.metadata.mockResolvedValue({
      width: 100,
      height: 100,
      format: 'png',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('resized'));

    const mockJob = {
      data: {
        filePath: '/tmp/upload.png',
        filename: 'upload.png',
        mimeType: 'image/png',
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processImage(mockJob);
    expect(result.filename).toBe('upload.png');
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/upload.png');
  });

  it('throws when no image source provided', async () => {
    const mockJob = {
      data: {
        filename: 'test.png',
        mimeType: 'image/png',
      },
      updateProgress: vi.fn(),
    } as any;

    await expect(processImage(mockJob)).rejects.toThrow('No image source provided');
  });
});
