import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Public()
  @Get('plans')
  async getPlans() {
    const data = await this.billing.getPlans();
    return { statusCode: 200, message: 'Plans retrieved', data };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Body() body: { planSlug: string; successUrl: string; cancelUrl: string }, @Req() req: Request) {
    const data = await this.billing.createCheckoutSession((req as any).user.id, body.planSlug, body.successUrl, body.cancelUrl);
    return { statusCode: 200, message: 'Checkout session created', data };
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(@Body() body: { returnUrl: string }, @Req() req: Request) {
    const data = await this.billing.createPortalSession((req as any).user.id, body.returnUrl);
    return { statusCode: 200, message: 'Portal session created', data };
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Req() req: Request) {
    const data = await this.billing.getSubscription((req as any).user.id);
    return { statusCode: 200, message: 'Subscription retrieved', data };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getBillingHistory(@Req() req: Request) {
    const data = await this.billing.getBillingHistory((req as any).user.id);
    return { statusCode: 200, message: 'Billing history retrieved', data };
  }

  @Post('promote')
  @UseGuards(JwtAuthGuard)
  async promoteProject(@Body() body: { projectId: string }, @Req() req: Request) {
    const data = await this.billing.promoteProject((req as any).user.id, body.projectId);
    return { statusCode: 200, message: 'Promotion checkout created', data };
  }

  @Post('donate')
  @UseGuards(JwtAuthGuard)
  async donate(@Body() body: { recipientId: string; amount: number; message?: string; anonymous?: boolean }, @Req() req: Request) {
    const data = await this.billing.createDonation((req as any).user.id, body.recipientId, body.amount, body.message, body.anonymous);
    return { statusCode: 200, message: 'Donation checkout created', data };
  }

  @Post('api-keys/:id/upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeApiKey(@Req() req: Request, @Param('id') id: string) {
    const data = await this.billing.upgradeApiKey((req as any).user.id, id);
    return { statusCode: 200, message: 'API key tier upgraded', data };
  }
}
