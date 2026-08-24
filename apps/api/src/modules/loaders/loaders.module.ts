import { Module } from '@nestjs/common';
import { LoadersController } from './loaders.controller';
import { LoadersService } from './loaders.service';

@Module({
  controllers: [LoadersController],
  providers: [LoadersService],
  exports: [LoadersService],
})
export class LoadersModule {}
