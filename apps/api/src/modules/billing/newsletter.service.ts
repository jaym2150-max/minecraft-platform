import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotent subscribe: re-subscribing an existing email is a no-op that
   * still reports success (avoids leaking who is subscribed via error
   * differentials).
   */
  async subscribe(email: string, ip?: string): Promise<{ subscribed: true }> {
    try {
      await this.prisma.newsletterSubscriber.create({
        data: { email, source: 'homepage' },
      });
      this.logger.log(`Newsletter signup from ${ip ?? 'unknown-ip'}`);
    } catch (err: any) {
      // P2002 = unique constraint violation → already subscribed; fine.
      if (err?.code !== 'P2002') {
        throw err;
      }
    }
    return { subscribed: true };
  }
}
