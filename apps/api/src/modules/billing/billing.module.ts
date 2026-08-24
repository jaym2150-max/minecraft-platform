import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { WebhookController } from './webhook.controller';
import { CreatorEarningsController } from './creator-earnings.controller';
import { CreatorEarningsService } from './creator-earnings.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [BillingController, WebhookController, CreatorEarningsController],
  providers: [BillingService, CreatorEarningsService],
  exports: [BillingService],
})
export class BillingModule {}
