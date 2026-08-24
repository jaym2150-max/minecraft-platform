import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';
import * as net from 'net';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private config: ConfigService) {}

  @Get()
  @Public()
  async check() {
    const clamav = await this.checkClamav();

    return {
      status: 'ok',
      clamav: clamav ? 'available' : 'unavailable',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkClamav(): Promise<boolean> {
    const host = this.config.get<string>('CLAMAV_HOST', 'localhost');
    const port = parseInt(this.config.get<string>('CLAMAV_PORT', '3310'), 10);

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);

      socket.on('connect', () => {
        socket.write('zPING\0');
      });

      socket.on('data', (data) => {
        if (data.toString().includes('PONG')) {
          socket.end();
          resolve(true);
        }
      });

      socket.on('error', () => resolve(false));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }
}
