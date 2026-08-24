// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSharpInstance = {
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

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: function () { this.send = mockS3Send; },
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

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
    mockSharpInstance.resize.mockClear();
    mockSharpInstance.webp.mockClear();
    mockSharpInstance.png.mockClear();
    mockSharpInstance.jpeg.mockClear();
    mockSharpInstance.toBuffer.mockReset();
    mockSharpInstance.metadata.mockReset();
    mockS3Send.mockReset();
  });

  it('processes image buffer through default variants', async () => {
    const inputBuffer = Buffer.from('fake-image-data');
    mockSharpInstance.metadata.mockResolvedValue({
      width: 1024,
      height: 768,
      format: 'png',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('variant-data'));
    mockS3Send.mockResolvedValue({});

    const mockJob = {
      data: {
        buffer: inputBuffer,
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
    expect(mockS3Send).toHaveBeenCalledTimes(4);
    expect(mockSharp).toHaveBeenCalledWith(inputBuffer);
  });

  it('uses custom variants when provided', async () => {
    const inputBuffer = Buffer.from('custom-variant-test');
    mockSharpInstance.metadata.mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('thumb-data'));
    mockS3Send.mockResolvedValue({});

    const customVariants = [
      { name: 'thumb', width: 100, height: 100, quality: 70, format: 'jpeg' as const },
    ];

    const mockJob = {
      data: {
        buffer: inputBuffer,
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

  it('reads from filePath when buffer not provided', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file-content'));

    mockSharpInstance.metadata.mockResolvedValue({
      width: 100,
      height: 100,
      format: 'png',
    });
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('resized'));
    mockS3Send.mockResolvedValue({});

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
