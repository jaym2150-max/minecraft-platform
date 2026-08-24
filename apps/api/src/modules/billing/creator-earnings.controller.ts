import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatorEarningsService } from './creator-earnings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Creator earnings & payout endpoints. All routes require an authenticated
 * session; users can only ever read/act on their own earnings.
 */
@ApiTags('creator-earnings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('creator/earnings')
export class CreatorEarningsController {
  constructor(private readonly earningsService: CreatorEarningsService) {}

  /** Summary: available balance, lifetime earnings, pending payouts. */
  @Get()
  async getSummary(@Req() req: any) {
    const data = await this.earningsService.getSummary(req.user.id);
    return { statusCode: 200, message: 'Earnings summary', data, timestamp: new Date().toISOString() };
  }

  /**
   * Connect a Stripe Express account (returns onboarding URL). Idempotent:
   * if already connected, returns the onboarding/dashboard link again.
   */
  @Post('payout-account')
  async connectPayoutAccount(@Req() req: any) {
    const data = await this.earningsService.createOrGetPayoutLink(req.user.id);
    return { statusCode: 200, message: 'Payout account link', data, timestamp: new Date().toISOString() };
  }

  /** Request a payout of the available balance to the connected account. */
  @Post('withdraw')
  async withdraw(@Req() req: any) {
    const data = await this.earningsService.requestWithdrawal(req.user.id);
    return { statusCode: 200, message: 'Payout requested', data, timestamp: new Date().toISOString() };
  }

  /** Payout history for the current user. */
  @Get('payouts')
  async listPayouts(@Req() req: any) {
    const data = await this.earningsService.listPayouts(req.user.id);
    return { statusCode: 200, message: 'Payout history', data, timestamp: new Date().toISOString() };
  }
}
