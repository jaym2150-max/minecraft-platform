import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  private readonly PROMO_PRICE_CENTS = 999; // $9.99 for 30 days of promotion
  private readonly PROMO_DURATION_DAYS = 30;

  readonly RATE_LIMITS: Record<string, { rpm: number; burst: number }> = {
    BASIC: { rpm: 100, burst: 20 },
    PRO: { rpm: 1000, burst: 100 },
    ENTERPRISE: { rpm: 10000, burst: 500 },
  };

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = this.config.get<string>('app.stripeSecretKey') || process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' } as any);
    }
  }

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }

  async createCheckoutSession(
    userId: string,
    planSlug: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: plan.name, description: plan.description || undefined },
            unit_amount: plan.price,
            recurring: { interval: plan.interval as 'month' | 'year' },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId: plan.id },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string, returnUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) throw new BadRequestException('No active subscription');
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  }

  async getBillingHistory(userId: string) {
    if (!this.stripe) return [];
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return [];

    const invoices = await this.stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 12,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      date: new Date(inv.created * 1000).toISOString(),
      pdf: inv.invoice_pdf,
    }));
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret =
      this.config.get<string>('app.stripeWebhookSecret') || process.env.STRIPE_WEBHOOK_SECRET;
    if (!this.stripe || !webhookSecret) {
      throw new BadRequestException('Stripe not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(sub);
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentSucceeded(pi);
        break;
      }
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (!userId || !planId || !session.subscription) return;

    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const stripeSub: any = await this.stripe.subscriptions.retrieve(subscriptionId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer as string },
    });

    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return;

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planId,
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE' as any,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
      create: {
        userId,
        planId,
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE' as any,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { creatorTier: plan.tier as any },
    });
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const invAny: any = invoice;
    if (!invAny.subscription) return;
    const subId =
      typeof invAny.subscription === 'string' ? invAny.subscription : invAny.subscription.id;
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subId },
    });
    if (!sub) return;

    const stripeSub: any = await this.stripe.subscriptions.retrieve(subId);
    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'ACTIVE' as any,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

    const subAny: any = subscription;
    const status =
      subAny.status === 'active'
        ? 'ACTIVE'
        : subAny.status === 'past_due'
          ? 'PAST_DUE'
          : subAny.status === 'canceled'
            ? 'CANCELED'
            : 'EXPIRED';

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: status as any,
        currentPeriodStart: new Date(subAny.current_period_start * 1000),
        currentPeriodEnd: new Date(subAny.current_period_end * 1000),
        cancelAtPeriodEnd: subAny.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELED' as any },
    });

    await this.prisma.user.update({
      where: { id: sub.userId },
      data: { creatorTier: 'FREE' as any },
    });
  }

  async promoteProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.authorId !== userId) throw new ForbiddenException('Not your project');

    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Project Promotion - 30 days' },
            unit_amount: this.PROMO_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { userId, projectId, type: 'promotion' },
      success_url: `${this.getWebUrl()}/mod/${project.slug}?promoted=1`,
      cancel_url: `${this.getWebUrl()}/dashboard/projects/${projectId}`,
    });

    return { url: session.url };
  }

  async createDonation(
    donorId: string,
    recipientId: string,
    amount: number,
    message?: string,
    anonymous?: boolean,
  ) {
    if (amount < 100) throw new BadRequestException('Minimum donation is $1.00');
    if (donorId === recipientId) throw new BadRequestException('Cannot donate to yourself');

    const user = await this.prisma.user.findUnique({ where: { id: recipientId } });
    if (!user) throw new NotFoundException('Recipient not found');
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Donation to ${user.username}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        donorId,
        recipientId,
        message: message || '',
        anonymous: anonymous ? '1' : '0',
        type: 'donation',
      },
      success_url: `${this.getWebUrl()}/user/${user.username}?donated=1`,
      cancel_url: `${this.getWebUrl()}/user/${user.username}`,
    });

    return { url: session.url };
  }

  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const meta = paymentIntent.metadata;
    if (meta?.type === 'promotion' && meta.projectId) {
      await this.prisma.promotedProject.upsert({
        where: { projectId: meta.projectId },
        update: {
          endsAt: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000),
          active: true,
          stripePaymentIntentId: paymentIntent.id,
        },
        create: {
          projectId: meta.projectId,
          endsAt: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000),
          stripePaymentIntentId: paymentIntent.id,
        },
      });
      await this.prisma.project.update({
        where: { id: meta.projectId },
        data: { promotedUntil: new Date(Date.now() + this.PROMO_DURATION_DAYS * 86400000) },
      });
    } else if (meta?.type === 'donation' && meta.donorId && meta.recipientId) {
      await this.prisma.donation.create({
        data: {
          amount: paymentIntent.amount,
          donorId: meta.donorId,
          recipientId: meta.recipientId,
          message: meta.message || null,
          anonymous: meta.anonymous === '1',
          stripePaymentIntentId: paymentIntent.id,
        },
      });
    }
  }

  async getRateLimitForApiKey(apiKeyId: string): Promise<{ rpm: number; burst: number }> {
    const key = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      select: { rateLimitTier: true },
    });
    const tier = key?.rateLimitTier || 'BASIC';
    return this.RATE_LIMITS[tier];
  }

  async upgradeApiKey(userId: string, apiKeyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creatorTier: true },
    });
    if (user?.creatorTier === 'FREE')
      throw new ForbiddenException('Upgrade to Creator tier to increase API limits');

    const tier: string = user?.creatorTier === 'PRO' ? 'PRO' : 'BASIC';

    await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { rateLimitTier: tier as any },
    });

    return { rateLimitTier: tier };
  }

  private getWebUrl(): string {
    return this.config.get<string>('app.webUrl') || process.env.WEB_URL || 'http://localhost:3003';
  }
}
