import { Controller, Post, Req, Headers } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@Controller('billing/webhook')
export class WebhookController {
  constructor(private billing: BillingService) {}

  @Public()
  @Post()
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    const raw = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    return this.billing.handleStripeWebhook(raw, signature);
  }
}
