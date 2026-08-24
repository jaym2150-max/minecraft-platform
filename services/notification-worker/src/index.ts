import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as nodemailer from 'nodemailer';
import * as net from 'net';
import { PrismaClient } from '@prisma/client';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://mcp:mcp@localhost:5432/minecraft_platform';

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@minecraftplatform.com';
const ALLOWED_WEBHOOK_DOMAINS = (process.env.ALLOWED_WEBHOOK_DOMAINS || '').split(',').filter(Boolean);

function isWebhookAllowed(url: string): boolean {
  if (ALLOWED_WEBHOOK_DOMAINS.length === 0) return false;
  try {
    const parsed = new URL(url);
    // M-W / H-W6: webhook calls must NOT target an IP address. An attacker
    // who registers a webhook URL like `http://10.0.0.5/admin` (the API's
    // internal admin port) or a public IP in their control bypasses the
    // domain allowlist and turns the notification worker into an SSRF /
    // intranet-probe vector. Reject anything whose hostname parses as an
    // IP literal (IPv4 OR IPv6). `net.isIP` returns 0 when not an IP.
    if (net.isIP(parsed.hostname) !== 0) return false;
    return ALLOWED_WEBHOOK_DOMAINS.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Escape a value for safe interpolation into HTML text content or an
 * attribute. Every value that lands in an email body — notification titles,
 * comment text, changelog, usernames, project titles, URLs — is
 * attacker-controllable (it originates from user input or other systems), so
 * it must be escaped to prevent stored XSS in HTML emails.
 */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a URL before placing it into an href attribute. Beyond HTML-escaping,
 * we also reject anything other than http/https so a "javascript:" or "data:"
 * URL can't execute when the recipient clicks the link.
 */
function safeUrl(value: unknown): string {
  const str = escapeHtml(value);
  if (!str) return '';
  // Only allow absolute http(s) URLs or server-relative paths.
  if (/^(https?:|\/)/i.test(str)) return str;
  return '#';
}

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  // M-W: lazyConnect so the "Service started" log line does not race ahead
  // of the actual TCP/Auth handshake to Redis. Combined with the
  // `await connection.ping()` in main() below, the worker now refuses to
  // declare itself ready until Redis has actually answered — a Redis that
  // is down at boot no longer produces a misleading "Service started".
  lazyConnect: true,
});

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  // M-W: the brittle `secure: SMTP_PORT === 465` heuristic mis-configures
  // port 587 (which must STARTTLS, not implicit TLS) and port 25. Use
  // nodemailer's documented: secure only when *implicit* TLS (465); for
  // 587/25 rely on `requireTLS:true` so STARTTLS is negotiated. Without
  // this a 587 server silently falls back to plaintext and ships the
  // notification payload (which can contain user content) in cleartext.
  secure: SMTP_PORT === 465,
  requireTLS: SMTP_PORT !== 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

const TYPE_TEMPLATES: Record<string, { subject: string; buildHtml: (data: any) => string }> = {
  comment: {
    subject: 'New comment on your project',
    buildHtml: (data) => `
      <h2>New Comment</h2>
      <p>${escapeHtml(data.commenterName)} commented on <strong>${escapeHtml(data.projectTitle)}</strong>:</p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 12px; color: #555;">${escapeHtml(data.commentContent)}</blockquote>
      <p><a href="${safeUrl(data.projectUrl)}">View comment</a></p>
    `,
  },
  version: {
    subject: 'New version released',
    buildHtml: (data) => `
      <h2>New Version Available</h2>
      <p><strong>${escapeHtml(data.projectTitle)}</strong> v${escapeHtml(data.version)} is now available.</p>
      <p>${escapeHtml(data.changelog)}</p>
      <p><a href="${safeUrl(data.projectUrl)}">View version</a></p>
    `,
  },
  team: {
    subject: 'Team membership update',
    buildHtml: (data) => `
      <h2>Team Update</h2>
      <p>${escapeHtml(data.message)}</p>
    `,
  },
  'email-verification': {
    subject: 'Verify your Minecraft Platform email',
    buildHtml: (data) => `
      <h2>Verify your email address</h2>
      <p>Click the button below to confirm your email and unlock all platform features (uploads, comments, notifications).</p>
      <p style="margin: 24px 0;">
        <a href="${safeUrl(data.verifyUrl)}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email</a>
      </p>
      <p style="color: #666; font-size: 12px;">If the button doesn't work, paste this link into your browser:<br />${safeUrl(data.verifyUrl)}</p>
      <p style="color: #888; font-size: 12px;">This link expires in 24 hours. If you didn't request this, you can safely ignore the email.</p>
    `,
  },
  'password-reset': {
    subject: 'Reset your Minecraft Platform password',
    buildHtml: (data) => `
      <h2>Reset your password</h2>
      <p>Someone (hopefully you) requested a password reset for your account. Click the button below to set a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${safeUrl(data.resetUrl)}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 12px;">If the button doesn't work, paste this link into your browser:<br />${safeUrl(data.resetUrl)}</p>
      <p style="color: #c00; font-size: 13px;">If you didn't request a password reset, you can ignore this email — your password will remain unchanged.</p>
      <p style="color: #888; font-size: 12px;">This link expires in 1 hour.</p>
    `,
  },
  system: {
    subject: 'System notification',
    buildHtml: (data) => `
      <h2>${escapeHtml(data.title) || 'Notification'}</h2>
      <p>${escapeHtml(data.body)}</p>
    `,
  },
  security: {
    subject: 'Security alert',
    buildHtml: (data) => `
      <h2>Security Alert</h2>
      <p>${escapeHtml(data.message) || 'A security event was detected on your account.'}</p>
      <p>If this wasn't you, please change your password immediately.</p>
    `,
  },
};

interface NotificationJobData {
  notificationId?: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  channels?: Array<'email' | 'in-app' | 'webhook'>;
}

async function processNotification(job: Job<NotificationJobData>): Promise<any> {
  const { userId, type, title, body, data, channels = ['in-app'] } = job.data;

  console.log(`[notification-worker] Processing ${type} for user ${userId}`);
  await job.updateProgress(20);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, emailVerified: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const results: Record<string, { sent: boolean; error?: string }> = {};

  if (channels.includes('in-app')) {
    try {
      const notificationId = job.data.notificationId;
      if (!notificationId) {
        throw new Error('Notification id missing from job payload');
      }
      const note = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!note) {
        throw new Error(`Notification ${notificationId} not found`);
      }
      results['in-app'] = { sent: true };
    } catch (err) {
      results['in-app'] = { sent: false, error: (err as Error).message };
      throw err;
    }
  }

  if (channels.includes('email') && user.email && user.emailVerified) {
    const template = TYPE_TEMPLATES[type] ?? TYPE_TEMPLATES['system'];
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16a34a;">Minecraft Platform</h1>
        </div>
        ${template.buildHtml({ ...data, title, body })}
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          You can <a href="${safeUrl(`${process.env.WEB_URL || 'http://localhost:3000'}/settings`)}">manage your notification preferences</a>.
        </p>
      </div>
    `;
    // M-W: plain-text alternative so text-only clients and accessibility
    // tools render usable content and spam filters that penalize HTML-only
    // messages don't down-rank legitimate platform email. We strip tags
    // rather than render a bespoke text template (good enough; matching
    // the HTML content verbatim is the maintainable path).
    const text = (title || body || data?.message || '')
      .toString()
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: user.email,
        subject: template.subject,
        html,
        text,
        // M-W (list-unsubscribe): makes the message standards-compliant for
        // bulk senders and lets clients surface a one-click unsubscribe. We
        // point at the user's notification-preferences page, not a magic
        // token URL, so no secret is embedded in a replyable header.
        headers: {
          'List-Unsubscribe': `<${safeUrl(`${process.env.WEB_URL || 'http://localhost:3000'}/settings/notifications`)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      results['email'] = { sent: true };
    } catch (err) {
      results['email'] = { sent: false, error: (err as Error).message };
      console.warn(`[notification-worker] Email send failed: ${(err as Error).message}`);
    }
  } else if (channels.includes('email')) {
    results['email'] = { sent: false, error: 'Email not verified' };
  }

  if (channels.includes('webhook') && data?.webhookUrl) {
    if (!isWebhookAllowed(data.webhookUrl)) {
      results['webhook'] = { sent: false, error: 'Webhook URL domain not allowed' };
    } else {
      try {
        // M-W / H-W6: webhook delivery must time out. A registered webhook
        // pointing at a slow/dead host would otherwise hang this job slot
        // indefinitely, leak BullMQ retries, and starve other notifications.
        // 10s is generous for a normal webhook and the default for our
        // upstream's published timeout contract.
        const res = await fetch(data.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, title, body, data }),
          signal: AbortSignal.timeout(10_000),
        });
        results['webhook'] = { sent: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
      } catch (err) {
        results['webhook'] = { sent: false, error: (err as Error).message };
      }
    }
  }

  await job.updateProgress(100);
  console.log(`[notification-worker] Notification ${job.id} processed:`, results);
  return { userId, type, results };
}

const worker = new Worker<NotificationJobData>('notifications', processNotification, {
  connection,
  concurrency: 4,
});

worker.on('completed', (job, result) => {
  console.log(`[notification-worker] Job ${job.id} completed for user ${result.userId}`);
});

worker.on('failed', (job, err) => {
  console.error(`[notification-worker] Job ${job?.id} failed:`, err.message);
});

async function main() {
  try {
    await connection.ping();
    console.log('[notification-worker] Connected to Redis');
  } catch (err) {
    console.error(
      `[notification-worker] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[notification-worker] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  console.log('[notification-worker] Service started, listening for notification jobs...');
}

main().catch((err) => {
  console.error('[notification-worker] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  // C18: guard against the double-SIGINT/SIGTERM race where a second Ctrl+C
  // (or orchestrator SIGTERM-then-SIGKILL) initiates a second close path
  // while the first is still awaiting `worker.close()`. Idempotent: the
  // second call is a no-op; the first proceeds in order — stop accepting
  // jobs first, await in-flight, THEN close Redis (so a job that is still
  // mid-PROCESS can ack/return its result), then disconnect Prisma.
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => { console.error('[notification-worker] Shutdown timed out, forcing exit'); process.exit(1); }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[notification-worker] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
    await prisma.$disconnect();
  } catch (err) {
    console.error('[notification-worker] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processNotification, TYPE_TEMPLATES, escapeHtml, safeUrl, isWebhookAllowed };