import { Controller, Post, Body, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';

class SubscribeDto {
  @IsEmail()
  email!: string;
}

/**
 * Public newsletter signup. Heavily rate-limited (5/min/IP) since it writes
 * to a unique-email table; duplicates are treated as success (idempotent)
 * so the UI can show the same confirmation either way.
 */
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async subscribe(@Body() dto: SubscribeDto, @Ip() ip?: string) {
    const data = await this.newsletterService.subscribe(dto.email.toLowerCase().trim(), ip);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscribed',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
