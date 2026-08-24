import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Creator earnings & payouts.
 *
 * Money model: each download accrues a micro-credit to the project author
 * (points-based, like CurseForge's Rewards Program). Points convert to USD
 * at POINTS_PER_USD. Accrual is recorded in `EarningLedger` rows written by
 * the analytics/download pipeline (idempotent per download event).
 *
 * Payouts run through Stripe Connect Express: the creator onboards once
 * (createOrGetPayoutLink), then withdraws available balance (requestWithdrawal)
 * which creates a Stripe transfer. If Stripe isn't configured (dev), we keep
 * the ledger working locally and return a clear "not configured" state so the
 * dashboard still renders end-to-end.
 */

/** 1000 points = $1 — mirrors CurseForge's rewards math for familiarity. */
const POINTS_PER_USD = 1000;
/** Minimum withdrawal: $25, standard for creator platforms. */
const MIN_WITHDRAWAL_USD = 25;

interface LedgerRow {
  amountPoints: number;
}

@Injectable()
export class CreatorEarningsService {
  private readonly logger = new Logger(CreatorEarningsService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const key = this.config.get<string>('app.stripeSecretKey') || process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2024-06-20' as any });
    }
  }

  /** Lifetime + available + pending totals for the creator dashboard. */
  async getSummary(userId: string) {
    const [lifetime, withdrawn, pending] = await Promise.all([
      this.prisma.earningLedger.aggregate({
        where: { userId },
        _sum: { amountPoints: true },
      }),
      this.prisma.payout.aggregate({
        where: { userId, status: { in: ['COMPLETED', 'PROCESSING'] } },
        _sum: { amountCents: true },
      }),
      this.prisma.payout.aggregate({
        where: { userId, status: 'PENDING' },
        _sum: { amountCents: true },
      }),
    ]);

    const lifetimePoints = lifetime._sum.amountPoints ?? 0;
    const withdrawnCents = withdrawn._sum.amountCents ?? 0;
    const pendingCents = pending._sum.amountCents ?? 0;

    // Available = lifetime value minus everything already paid/being paid out.
    const lifetimeCents = Math.floor(lifetimePoints / POINTS_PER_USD) * 100;
    const availableCents = Math.max(0, lifetimeCents - withdrawnCents - pendingCents);

    const account = await this.prisma.payoutAccount.findUnique({ where: { userId } });

    return {
      pointsBalance: Math.max(0, lifetimePoints - Math.floor((withdrawnCents + pendingCents) / 100) * POINTS_PER_USD),
      lifetimeCents,
      availableCents,
      pendingCents,
      minWithdrawalCents: MIN_WITHDRAWAL_USD * 100,
      currency: 'usd',
      payoutConnected: !!account?.stripeAccountId,
      payoutsEnabled: account?.payoutsEnabled ?? false,
    };
  }

  /**
   * Create (or fetch) a Stripe Express onboarding/dashboard link.
   * In dev without Stripe keys, returns `configured: false` and the UI shows
   * a setup-needed card instead of crashing.
   */
  async createOrGetPayoutLink(userId: string) {
    if (!this.stripe) {
      return { configured: false as const, url: null };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });
    if (!user) throw new NotFoundException('User not found');

    let account = await this.prisma.payoutAccount.findUnique({ where: { userId } });

    if (!account?.stripeAccountId) {
      const stripeAccount = await this.stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { userId, username: user.username },
        capabilities: { transfers: { requested: true } },
      });
      account = await this.prisma.payoutAccount.upsert({
        where: { userId },
        update: { stripeAccountId: stripeAccount.id },
        create: { userId, stripeAccountId: stripeAccount.id },
      });
    }

    const returnUrl = this.config.get<string>('app.webUrl') || process.env.WEB_URL || 'http://localhost:3003';
    const link = await this.stripe.accountLinks.create({
      account: account.stripeAccountId,
      refresh_url: `${returnUrl}/dashboard/billing?payout=refresh`,
      return_url: `${returnUrl}/dashboard/billing?payout=done`,
      type: account.payoutsEnabled ? 'account_onboarding' : 'account_onboarding',
    });

    return { configured: true as const, url: link.url };
  }

  /** Withdraw available balance to the connected Stripe account. */
  async requestWithdrawal(userId: string) {
    const summary = await this.getSummary(userId);

    if (!summary.payoutConnected || !summary.payoutsEnabled) {
      throw new BadRequestException('Connect a payout account before withdrawing');
    }
    if (summary.availableCents < summary.minWithdrawalCents) {
      throw new BadRequestException(
        `Minimum withdrawal is $${(summary.minWithdrawalCents / 100).toFixed(2)}`,
      );
    }

    const account = await this.prisma.payoutAccount.findUnique({ where: { userId } });
    if (!account?.stripeAccountId) throw new BadRequestException('No payout account');

    let stripePayoutId: string | null = null;
    if (this.stripe) {
      try {
        const transfer = await this.stripe.transfers.create({
          amount: summary.availableCents,
          currency: 'usd',
          destination: account.stripeAccountId,
          metadata: { userId },
        });
        stripePayoutId = transfer.id;
      } catch (err: any) {
        this.logger.error(`Stripe transfer failed for ${userId}: ${err.message}`);
        throw new BadRequestException('Payout transfer failed — try again shortly');
      }
    }

    const payout = await this.prisma.payout.create({
      data: {
        userId,
        amountCents: summary.availableCents,
        status: stripePayoutId ? 'PROCESSING' : 'PENDING',
        stripeTransferId: stripePayoutId,
      },
    });

    return { payoutId: payout.id, amountCents: payout.amountCents, status: payout.status };
  }

  async listPayouts(userId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return payouts;
  }
}
