import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, BullModule.registerQueue({ name: 'image-process' })],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
