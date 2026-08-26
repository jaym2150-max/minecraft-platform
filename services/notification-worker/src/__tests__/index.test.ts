// @ts-nocheck
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const mockPrisma = {
  user: { findUnique: vi.fn() },
  notification: { findUnique: vi.fn() },
};

const mockTransporter = { sendMail: vi.fn() };

vi.mock('@prisma/client', () => {
  function MockPrismaClient() {
    return mockPrisma;
  }
  return { PrismaClient: MockPrismaClient };
});

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => mockTransporter),
}));

vi.mock('bullmq', () => {
  function MockWorker() {
    this.on = vi.fn().mockReturnThis();
    this.run = vi.fn();
  }
  return { Worker: MockWorker };
});

vi.mock('ioredis', () => {
  function MockRedis() {
    this.ping = vi.fn();
    this.quit = vi.fn();
  }
  return { default: MockRedis };
});

const { escapeHtml, safeUrl, isWebhookAllowed, processNotification, TYPE_TEMPLATES } =
  await import('../index.js');

describe('escapeHtml', () => {
  it('escapes & < > " \'', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('converts non-string values to string', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(0)).toBe('0');
    expect(escapeHtml(false)).toBe('false');
  });

  it('passes through safe strings unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
    expect(escapeHtml('no_special_chars')).toBe('no_special_chars');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's a test")).toBe('it&#39;s a test');
  });
});

describe('safeUrl', () => {
  it('allows https URLs', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows http URLs', () => {
    expect(safeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows server-relative paths', () => {
    expect(safeUrl('/settings')).toBe('/settings');
    expect(safeUrl('/projects/123')).toBe('/projects/123');
  });

  it('rejects javascript: URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
  });

  it('rejects data: URLs', () => {
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('returns empty string for null/undefined', () => {
    expect(safeUrl(null)).toBe('');
    expect(safeUrl(undefined)).toBe('');
  });

  it('rejects vbscript: URLs', () => {
    expect(safeUrl('vbscript:msgbox("xss")')).toBe('#');
  });

  it('HTML-escapes the URL value', () => {
    expect(safeUrl('<script>alert(1)</script>')).toBe('#');
  });
});

describe('isWebhookAllowed', () => {
  // The worker's dotenv bootstrap (override:true) re-reads the root .env at
  // import time and blanks this var, so set it AFTER the dynamic import. The
  // allowlist is read at call time, so assignment here is effective.
  beforeAll(() => {
    process.env.ALLOWED_WEBHOOK_DOMAINS = 'hooks.example.com,api.example.org';
  });

  it('allows exact match domain', () => {
    expect(isWebhookAllowed('https://hooks.example.com/notify')).toBe(true);
  });

  it('allows subdomain of allowed domain', () => {
    expect(isWebhookAllowed('https://app.hooks.example.com/callback')).toBe(true);
  });

  it('rejects non-matching domain', () => {
    expect(isWebhookAllowed('https://evil.com/webhook')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(isWebhookAllowed('not-a-url')).toBe(false);
  });

  it('rejects subdomain of non-matching domain that contains allowed domain', () => {
    expect(isWebhookAllowed('https://hooks.example.com.evil.net')).toBe(false);
  });
});

describe('TYPE_TEMPLATES', () => {
  it('has all expected template types', () => {
    expect(TYPE_TEMPLATES).toHaveProperty('comment');
    expect(TYPE_TEMPLATES).toHaveProperty('version');
    expect(TYPE_TEMPLATES).toHaveProperty('team');
    expect(TYPE_TEMPLATES).toHaveProperty('system');
    expect(TYPE_TEMPLATES).toHaveProperty('security');
  });

  it('comment template builds HTML with escaped values', () => {
    const html = TYPE_TEMPLATES.comment.buildHtml({
      commenterName: '<script>alert(1)</script>',
      projectTitle: 'Test Mod',
      commentContent: 'Nice mod!',
      projectUrl: 'https://example.com/mod/test',
    });
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Test Mod');
    expect(html).toContain('Nice mod!');
  });

  it('version template builds HTML', () => {
    const html = TYPE_TEMPLATES.version.buildHtml({
      projectTitle: 'Sodium',
      version: '1.2.3',
      changelog: 'Fixed crashes',
      projectUrl: 'https://example.com/mod/sodium',
    });
    expect(html).toContain('Sodium');
    expect(html).toContain('1.2.3');
    expect(html).toContain('Fixed crashes');
  });

  it('security template includes warning text', () => {
    const html = TYPE_TEMPLATES.security.buildHtml({
      message: 'New login detected',
    });
    expect(html).toContain('Security Alert');
    expect(html).toContain('change your password immediately');
  });

  it('system template uses title and body', () => {
    const html = TYPE_TEMPLATES.system.buildHtml({
      title: 'Welcome!',
      body: 'Thanks for joining.',
    });
    expect(html).toContain('Welcome!');
    expect(html).toContain('Thanks for joining.');
  });

  it('team template renders message', () => {
    const html = TYPE_TEMPLATES.team.buildHtml({
      message: 'You were added as a developer.',
    });
    expect(html).toContain('You were added as a developer.');
  });
});

describe('processNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates in-app notification', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'test@example.com',
      username: 'tester',
      emailVerified: true,
    });
    mockPrisma.notification.findUnique.mockResolvedValueOnce({ id: 'n1', userId: 'u1' });

    const mockJob = {
      id: 'notification:n1',
      data: {
        notificationId: 'n1',
        userId: 'u1',
        type: 'system',
        title: 'Test notification',
        body: 'This is a test',
        channels: ['in-app'],
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processNotification(mockJob);

    expect(result.results['in-app'].sent).toBe(true);
    expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({ where: { id: 'n1' } });
  });

  it('throws if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const mockJob = {
      data: { userId: 'nonexistent', type: 'system', title: '', channels: ['in-app'] },
      updateProgress: vi.fn(),
    } as any;

    await expect(processNotification(mockJob)).rejects.toThrow('User nonexistent not found');
  });

  it('skips email if user email is not verified', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'unverified@example.com',
      username: 'tester',
      emailVerified: false,
    });

    const mockJob = {
      data: {
        userId: 'u1',
        type: 'system',
        title: 'Test',
        channels: ['email'],
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processNotification(mockJob);
    expect(result.results['email'].sent).toBe(false);
    expect(result.results['email'].error).toBe('Email not verified');
  });

  it('rethrows if in-app notification not found so BullMQ can retry', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'test@example.com',
      username: 'tester',
      emailVerified: true,
    });
    mockPrisma.notification.findUnique.mockResolvedValueOnce(null);

    const mockJob = {
      id: 'notification:n1',
      data: {
        notificationId: 'n1',
        userId: 'u1',
        type: 'system',
        title: 'Test',
        channels: ['in-app'],
      },
      updateProgress: vi.fn(),
    } as any;

    await expect(processNotification(mockJob)).rejects.toThrow('Notification n1 not found');
  });
});
